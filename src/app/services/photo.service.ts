import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';


@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = "photo";

  constructor() { }

  public async addNewToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });
    this.photos.unshift({ filepath: "soon...", webviewPath: capturedPhoto.webPath! });
  }

  private async savePicture(photo: Photo) {
    const base64Data = await this.readAsBase64(photo); // Write the file to the data directory
    const fileName = Date.now() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: fileName,
      directory: Directory.Data
    });
    return {
      filepath: fileName,
      webviewPath: photo.webPath
    }
  }

  private async readAsBase64(photo: Photo) {
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
    return await this.convertBlobToBase64(blob) as string;
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };

    reader.readAsDataURL(blob);

  });


  public async loadSaved() {
    const { value } = await Preferences.get({
      key: this.PHOTO_STORAGE
    });

    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];
    for (let photo of this.photos) {
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data
      });

      photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
    }
  }

}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;

}