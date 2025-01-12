import { Client } from '@stomp/stompjs'
import store from '../store/store';
import { Point } from '../interfaces/Point';
import { addPoint, clearPoints } from '../store/slices/pointsSlice';
import { CalculationRequest } from '../interfaces/CalculationRequest';
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
        const point: Point = JSON.parse(response.body);
        const points = store.getState().points.points;
        if (!points.includes(point)){
            store.dispatch(addPoint(point))
        }
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
    removeUser(currentUser.id);

    store.dispatch(clearPoints());
    stompClient.deactivate();
}

export function registerUser(userId: string) {
    stompClient.publish({
        destination: `/app/newUser/${userId}`
    });
}

export function removeUser(userId: string) {
    stompClient.publish({
        destination: `/app/removeUser/${userId}`,
    });
}


export function calculate(request: CalculationRequest){
    stompClient.publish({
        destination: "/app/calculate",
        body: JSON.stringify(request)
    });

    console.log('[SEND ========>]',request);
}