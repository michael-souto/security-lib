import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import * as CryptoJS from 'crypto-js';


@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private key: string = '';

  constructor() {
    this.initializeKey();
  }

  private async initializeKey() {
    try {
      const info = await Device.getId();
      this.key = info.identifier;
    } catch (error) {
      console.error('Error getting device ID:', error);
    }
  }

  private getKey(): string {
    if (!this.key) {
      throw new Error('Encryption key not initialized');
    }
    return this.key;
  }

  encrypt(data: string): string {
    const key = CryptoJS.enc.Utf8.parse(this.getKey());
    const iv = CryptoJS.lib.WordArray.random(16);

    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    // Concatenate IV and encrypted data
    const ivHex = iv.toString(CryptoJS.enc.Hex);
    const encryptedHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);

    return `${ivHex}:${encryptedHex}`;
  }

  decrypt(data: string): string {
    const [ivHex, encryptedHex] = data.split(':');

    const key = CryptoJS.enc.Utf8.parse(this.getKey());
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);

    const decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted }, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
