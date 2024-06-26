import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from '../environments/environment';
import { ComponentBase } from '../shared/class/ComponentBase.class';
import { GetLoggedInUserDetailI } from '../app/response/responseG.response';
import { APIRoutes } from '../shared/constants/apiRoutes.constant';
import { INotificationModel, NotificationResponse } from '../app/model/notification.model';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService extends ComponentBase {

  constructor(private _utilService: UtilService){
    super();
  }

  public requestPermission() {
    const messaging = getMessaging();
    getToken(messaging,
      { vapidKey: environment.firebase.vapidKey }).then(
        (currentToken) => {
          if (currentToken) {
            console.log("Hurraaa!!! we got the token.....");
            console.log(currentToken);
            this.saveToken(currentToken);
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        }).catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
        });
  }

  public listen() {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {

      const nofication = payload as NotificationResponse;
      console.log('Message received. ', payload.data);

      // if(this._utilService.currentOpenedChat == nofication.notification.userId){
      // }
      console.log(this._utilService.receiverId);
      // this._utilService.getChatByIdE.emit(this._utilService.receiverId);
      this._utilService.isListennotificationE.emit(this._utilService.receiverId);
    });
  }


  public sendNotification(obj: { receiverSystemToken: string, title: string, body: string }, loggedInUserId: number) {

    console.log(loggedInUserId);

    const url = 'https://fcm.googleapis.com/fcm/send';
    const newMsg: INotificationModel = {
      notification: {
        title: obj.title,
        body: obj.body,
        userId: loggedInUserId
      },

      to: obj.receiverSystemToken
    }

    fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'key=AAAA5N9GikU:APA91bE6i7bh3atMvh671HBpD7ab3H6BHG9qbwJHpNOeING93nOfRCHt-XHdoGFcOujelFyN1EGleLaWoCFquNQxRkWFLwM6d_PIoloeJh7Ngtw2J0z5kOufWtx8Lz3OLIHTx7in8oD1',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newMsg)
    })
  }

  private saveToken(token: string){
    const newToken: {systemToken: string} = {
      systemToken: token
    };

    this.putAPICallPromise<{systemToken: string}, GetLoggedInUserDetailI<null>>(APIRoutes.updateSystemToken, newToken, this.headerOption).then(
      (res) =>{
        console.log(res);
      }
    )
  }
}
