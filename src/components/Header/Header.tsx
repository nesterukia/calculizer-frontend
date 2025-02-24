import styles from './Header.module.css'
import axios from 'axios'
import { connect, disconnect} from '../../websocket/WebSocketAPI'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { setUser, toggleConnection } from '../../store/slices/connectionSlice'
import {v4 as uuidv4} from 'uuid';
import calculatorImg from './../../../public/calculate.png';

export const Header = () => {

    const dispatch = useDispatch();
    const {isConnected} = useSelector((state: RootState) => state.connection);
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        handleConnect();
    }

    const handleConnect = () => {
        const id = uuidv4();
        dispatch(setUser({id}));
        connect();
        setTimeout(() => {
            const newUserApiUrl = `${window.location}newUser/${id}`;
            axios.post(newUserApiUrl).then((response) => console.log(response));
        }, 500)
    }

    const handleDisconnect = () => {
        disconnect();
        dispatch(toggleConnection());
        dispatch(setUser({id: ''}));
    }

    return(
        <header className={styles.header} >
            <h2 className={styles.logo}>
                <img src={calculatorImg} alt="calculator" className={styles.icon}/>
                КАЛЬКУЛЯЙЗЕР-3000
            </h2>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formContainer}>
                    <button id="connect" className={styles.button} type="button" disabled={isConnected} onClick={handleConnect}>
                        Connect
                    </button>
                    <button id="disconnect" className={styles.button} type="button" disabled={!isConnected} onClick={handleDisconnect}>
                        Disconnect
                    </button>
                </div>
            </form>
        </header>
    )
}