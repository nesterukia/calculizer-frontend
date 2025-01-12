import { Controls } from '../Controls/Controls';
import { Graph } from '../Graph/Graph';
import styles from './Calculator.module.css';

interface IProps{
    disabled: boolean
}

export const Calculator = ({ disabled }: IProps) => {
   return(
    <div className={disabled ? `${styles.container} ${styles.disabled}` : styles.container}>
        <Graph />
        <Controls/>
    </div>
   ) 
}