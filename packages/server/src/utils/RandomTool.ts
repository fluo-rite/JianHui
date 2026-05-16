import { Injectable } from '@nestjs/common';

@Injectable()
export class RandomTool {
  // 随机生成数字
  randomCode() {
    return Math.floor(Math.random() * (9999 - 1000)) + 1000;
  }
  // 随机生成头像
  randomAvatar() {
    const avatarIndex = Math.floor(Math.random() * 20) + 1;
    return `https://placehold.co/120x120/f5f5f5/000000/png?text=JH${avatarIndex}`;
  }
  // 随机生成昵称
  randomName() {
    return `编程小白${Math.floor(Math.random() * 10000)}`;
  }
}
