import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'avatarImageUrl',
  standalone: true,
})
export class AvatarImageUrlPipe implements PipeTransform {
  transform(avatarId: number | null | undefined): string | null {
    if (avatarId === null || avatarId === undefined) {
      return null;
    }

    return `assets/img/avatar_${avatarId}.png`;
  }
}
