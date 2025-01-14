import { ChangeEvent, useEffect, useState } from 'react'
import axios from 'axios'
import styles from './Controls.module.css'
import { CalculationRequest } from '../../interfaces/CalculationRequest'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { calculate } from '../../websocket/WebSocketAPI'
import { ControlsValue } from '../../interfaces/ControlsValue'
import { Calculation, CalculationStatusType } from '../../interfaces/Calculation'
import { clearPoints } from '../../store/slices/pointsSlice'
import NP from 'number-precision'
import { setControls } from '../../store/slices/controlsSlice'

export const Controls = () => {
    const user = useSelector((state: RootState) => state.connection.user);
    const dispatch = useDispatch();

    const INIT_FUNCTIONS: string[] = []
    const INIT_CONTROLS_VALUE: ControlsValue = {
        start: 0,
        end: 10,
        step: 1,
        function: ''
    }

    const INIT_CALCULATION: Calculation = {
        status: CalculationStatusType.READY,
        currentX: INIT_CONTROLS_VALUE.start
    }

    const [functions, setFunctions] = useState(INIT_FUNCTIONS);

    useEffect(() => {
        const functionsApiUrl = `${window.location}functions`
        axios.get(functionsApiUrl).then((response) => {
          const allFunctions = response.data;
          setFunctions(allFunctions);
          INIT_CONTROLS_VALUE.function = allFunctions[0];
          dispatch(setControls(INIT_CONTROLS_VALUE));
        });
    }, [setFunctions]);


    const [controlsValue, setControlsValue] = useState(INIT_CONTROLS_VALUE);
    const [calculation, setCalculation] = useState(INIT_CALCULATION);

    useEffect(() => {
        switch(calculation.status){
            case CalculationStatusType.RUNNING:
                console.log('CALCULATION RUNNING');
                    setTimeout(() => {
                        const request: CalculationRequest = {
                            user_id: user.id,
                            function_type: controlsValue.function,
                            x_coordinate: NP.round(calculation.currentX, 3)
                        }

                        calculate(request);

                        setCalculation((prev) => {
                            return {
                                ...prev, 
                                currentX: NP.plus(prev.currentX, controlsValue.step) > controlsValue.end ? controlsValue.end : NP.plus(prev.currentX, controlsValue.step)
                            }
                        })

                        if (calculation.currentX >= controlsValue.end){
                            setCalculation({
                                currentX: controlsValue.start,
                                status: CalculationStatusType.READY
                            });
                        }
                    }, 128)
                break;
            case CalculationStatusType.PAUSED:
                console.log('CALCULATION PAUSED');
                break;
            case CalculationStatusType.READY:
                console.log('CALCULATION READY');
                break;
            default:
                console.error('[Controls.tsx] UNKNOWN ERROR DURING CALCULATION')
        }
    }, [calculation]) 

    useEffect(() => {
        dispatch(setControls(controlsValue))
    }, [controlsValue])

    const handleStartInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        let newStart: number = 0;
        if(e.currentTarget.value){
            newStart = parseFloat(e.currentTarget.value);
        }

        const isValid: boolean = true;
        if (isValid){
            setControlsValue(
                {
                    ...controlsValue,
                    start: newStart 
                }
            )
            setCalculation(
                {
                    ...calculation,
                    currentX: newStart
                }
            )
        }
    }

    const handleEndInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        let newEnd: number = 0;
        if(e.currentTarget.value){
            newEnd = parseFloat(e.currentTarget.value);
            const isValid: boolean = (newEnd - controlsValue.start > 0);
            if (isValid){
                setControlsValue(
                    {
                        ...controlsValue,
                        end: newEnd,
                        step: (newEnd - controlsValue.start > controlsValue.step) ? controlsValue.step : newEnd - controlsValue.start
                    }
                )
            }
        } else {
            setControlsValue(
                {
                    ...controlsValue,
                    end: 0,
                }
            )
        }
    }

    const handleStepInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        let newStep: number = 0;
        if(e.currentTarget.value){
            newStep = parseFloat(e.currentTarget.value);
            const isValid: boolean = (controlsValue.end - controlsValue.start > newStep);
            if (isValid){
                setControlsValue(
                    {
                        ...controlsValue,
                        step: newStep 
                    }
                )
            }
        } else {
            setControlsValue(
                {
                    ...controlsValue,
                    end: 0,
                }
            )
        }
    }

    const handleFunctionSelectorChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setControlsValue(
            {
                ...controlsValue,
                function: e.currentTarget.value
            }
        )
    }

    const toggleCalculation = () => {
        if ((controlsValue.start < controlsValue.end) && (controlsValue.step > 0)) {
            let newStatus: CalculationStatusType = calculation.status;
            switch(calculation.status){
                case CalculationStatusType.READY:
                    dispatch(clearPoints());
                    newStatus = CalculationStatusType.RUNNING;
                    break;
                case CalculationStatusType.RUNNING:
                    newStatus = CalculationStatusType.PAUSED;
                    break;
                case CalculationStatusType.PAUSED:
                    newStatus = CalculationStatusType.RUNNING;
                    break;
                case CalculationStatusType.STOPPED:
                case CalculationStatusType.ERROR:
                    newStatus = CalculationStatusType.READY;
                    break;
            }
    
            setCalculation({
                ...calculation, 
                status: newStatus
            }) 

        } else {
            window.alert('Заполните поля корректно!')
        }
    }
    
    const handleReset = () => {
        dispatch(clearPoints());
        setControlsValue({...INIT_CONTROLS_VALUE, function: functions[0]});
        dispatch(setControls(controlsValue));
        setCalculation(INIT_CALCULATION);
    }

    return(
        <div className={styles.container}>
            <form action="" className={styles.controls}>
                <label htmlFor='function' className={styles.label}>
                    <span>Тип функции:</span>
                    <select 
                        className={styles.input} 
                        id="function" 
                        onChange={handleFunctionSelectorChange}
                        disabled={calculation.status === CalculationStatusType.RUNNING}
                        value={controlsValue.function}
                    >
                        {
                            functions.map((functionName: string, i) => 
                                <option key={i} value={functionName}>
                                    {functionName}
                                </option>
                            )
                        }
                    </select>
                </label>
                <label htmlFor='start' className={styles.label}> 
                    <span>Старт:</span>
                    <input 
                        className={styles.input}
                        type="number" 
                        id="start"
                        step="0.1"
                        placeholder='Левая граница графика' 
                        value={controlsValue.start} 
                        onChange={handleStartInputChange}
                        disabled={[CalculationStatusType.RUNNING, CalculationStatusType.PAUSED].includes(calculation.status)}
                    />
                </label>
                <label htmlFor='end' className={styles.label}> 
                    <span>Финиш:</span>
                    <input 
                        className={styles.input}
                        type="number" 
                        id="end" 
                        step="0.1"
                        placeholder='Правая граница графика' 
                        value={controlsValue.end} 
                        onChange={handleEndInputChange}
                        disabled={calculation.status === CalculationStatusType.RUNNING}
                    />
                </label>
                <label htmlFor='step' className={styles.label}>
                    <span>Шаг:</span> 
                    <input 
                        className={styles.input}
                        type="number" 
                        id="step" 
                        step="0.1"
                        placeholder='Шаг расчета' 
                        value={controlsValue.step} 
                        onChange={handleStepInputChange}
                        disabled={calculation.status === CalculationStatusType.RUNNING}
                    />
                </label>
                <div className={styles.buttons}>
                    <button 
                        type="button" 
                        onClick={toggleCalculation} 
                    >
                        { calculation.status === CalculationStatusType.RUNNING ? 'Stop' : 'Start'}
                    </button>

                    <button 
                        type='button' 
                        onClick={handleReset} 
                        disabled={calculation.status === CalculationStatusType.RUNNING}
                    >
                        Reset
                    </button>
                </div>

            </form>
        </div>
    )
}