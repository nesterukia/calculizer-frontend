import { ChangeEvent, useEffect, useState } from 'react'
import axios from 'axios'
import styles from './Controls.module.css'
import { CalculationRequest } from '../../interfaces/CalculationRequest'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { ControlsValue } from '../../interfaces/ControlsValue'
import { Calculation, CalculationStatusType } from '../../interfaces/Calculation'
import { clearPoints } from '../../store/slices/pointsSlice'
import { setControls } from '../../store/slices/controlsSlice'
import { Point } from '../../interfaces/Point'

export const Controls = () => {
    const user = useSelector((state: RootState) => state.connection.user);
    const pointsFromStore: Point[] = useSelector((state: RootState) => state.points.points);
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
        if(pointsFromStore.some(point => point.xCoordinate === controlsValue.end)){
            setCalculation({
                ...calculation, 
                status: CalculationStatusType.READY
            }) 
        }
    }, [pointsFromStore])

    useEffect(() => {
        switch(calculation.status){
            case CalculationStatusType.RUNNING:
                console.log('CALCULATION RUNNING');
                break;
            case CalculationStatusType.PAUSED:
                console.log('CALCULATION PAUSED');
                break;
            case CalculationStatusType.READY:
                console.log('CALCULATION READY');
                console.log('ALL POINTS: ', pointsFromStore);
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
                    const request: CalculationRequest = {
                        start: controlsValue.start,
                        end: controlsValue.end,
                        step: controlsValue.step,
                        function_type: controlsValue.function
                    }
                    const startApiUrl = `${window.location}startCalculations/${user.id}`;
                    axios.post(startApiUrl, request).then((response) => console.log(response));
                    break;
                case CalculationStatusType.RUNNING:
                    newStatus = CalculationStatusType.PAUSED;
                    const pauseApiUrl = `${window.location}pauseCalculations/${user.id}`;
                    axios.post(pauseApiUrl).then((response) => console.log(response));
                    break;
                case CalculationStatusType.PAUSED:
                    newStatus = CalculationStatusType.RUNNING;
                    const resumeApiUrl = `${window.location}resumeCalculations/${user.id}`;
                    axios.post(resumeApiUrl).then((response) => console.log(response));
                    break;
                case CalculationStatusType.STOPPED:
                case CalculationStatusType.ERROR:
                    newStatus = CalculationStatusType.READY;
                    const stopApiUrl = `${window.location}stopCalculations/${user.id}`;
                    axios.post(stopApiUrl).then((response) => console.log(response));
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
                        disabled={[CalculationStatusType.RUNNING, CalculationStatusType.PAUSED].includes(calculation.status)}
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
                        disabled={[CalculationStatusType.RUNNING, CalculationStatusType.PAUSED].includes(calculation.status)}
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
                        disabled={[CalculationStatusType.RUNNING, CalculationStatusType.PAUSED].includes(calculation.status)}
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