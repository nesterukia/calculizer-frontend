import { Client } from '@stomp/stompjs'
import store from '../store/store';
import axios from 'axios';
import { Point } from '../interfaces/Point';
import { addPoints, clearPoints } from '../store/slices/pointsSlice';
import { toggleConnection } from '../store/slices/connectionSlice';

const serverHost = window.location.host;
const brokerURL = `ws://${serverHost}/gs-guide-websocket`

const stompClient = new Client();

stompClient.configure({
brokerURL,
onConnect: (frame) => {
    console.log('Connected: ' + frame);

    const userId = store.getState().connection.user.id;
    console.log('Subscribed as', userId)

    stompClient.subscribe(`/user/${userId}/calculation`, (response) => {
        const points: Point[] = JSON.parse(response.body);
        store.dispatch(addPoints(points))
    });
},
});


stompClient.onWebSocketError = (error) => {
    console.error('Error with websocket', error);
};

stompClient.onStompError = (frame) => {
    console.error('Broker reported error: ' + frame.headers['message']);
    console.error('Additional details: ' + frame.body);
};

export function connect() {
    stompClient.activate();
    store.dispatch(toggleConnection());
}

export function disconnect() {
    const currentUser = store.getState().connection.user;
    const removeUserApiUrl = `${window.location}removeUser/${currentUser.id}`;
    axios.post(removeUserApiUrl).then((response) => console.log(response));

    store.dispatch(clearPoints());
    stompClient.deactivate();
}