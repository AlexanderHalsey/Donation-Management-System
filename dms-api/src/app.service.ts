import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRandomColor(): string {
    return (
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
    );
  }
}
