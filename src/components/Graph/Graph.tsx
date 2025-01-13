import { useEffect, useState } from 'react'
import styles from './Graph.module.css'
import { Chart as ChartJS, defaults } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import { useSelector } from 'react-redux'
import { Point } from '../../interfaces/Point'
import { RootState } from '../../store/store'
import { ControlsValue } from '../../interfaces/ControlsValue';

defaults.maintainAspectRatio = false;
defaults.responsive = true;

console.log(ChartJS);

interface DataSet{
    label: string,
    data: number[],
    backgroundColor?: string,
    borderColor?: string
}

interface Data{
    labels: string[],
    datasets: DataSet[],
    options: Object
}

export const Graph = () => {
    const INIT_DATA: Data = {
        labels: ['type of function'],
        datasets: [{
            label: "Let's build graph.",
            data: [],
            backgroundColor: "red",
            borderColor: "red"
        }],
        options: {
            scales: {
              x: {
                type: 'linear', /* <--- this */
              },
              y: {
                type: 'linear', /* <--- this */
              }
            }
          }
    }

    const pointsFromStore: Point[] = useSelector((state: RootState) => state.points.points);
    const controls: ControlsValue = useSelector((state: RootState) => state.controls);
    const [data, setData] = useState(INIT_DATA);

    useEffect(() => {
        setData({
            ...data,
            labels: pointsFromStore.map((p: Point) => p.xCoordinate.toString()),
            datasets: [
                {
                    label: controls.function,
                    data: pointsFromStore.map((p: Point) => p.yCoordinate),
                    backgroundColor: "red",
                    borderColor: "red"
                }
            ]
        })

    }, [pointsFromStore, controls])

    return(
        <div className={styles.container}>
            <Line
                data={{...data}}
                options={{
                    plugins: {
                        title: {
                            text: "Our cool client-server graph builder",
                        },
                    },
                }}
            />  
        </div>
    )
}