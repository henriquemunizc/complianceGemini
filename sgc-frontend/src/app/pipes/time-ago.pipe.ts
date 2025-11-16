import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para converter timestamps em formato relativo (ex: "há 2 horas", "ontem").
 */
@Pipe({
  name: 'timeAgo',
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) {
      return 'agora mesmo';
    } else if (diffMin < 60) {
      return `há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHour < 24) {
      return `há ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;
    } else if (diffDay === 1) {
      return 'ontem';
    } else if (diffDay < 7) {
      return `há ${diffDay} dias`;
    } else if (diffWeek < 4) {
      return `há ${diffWeek} ${diffWeek === 1 ? 'semana' : 'semanas'}`;
    } else if (diffMonth < 12) {
      return `há ${diffMonth} ${diffMonth === 1 ? 'mês' : 'meses'}`;
    } else {
      return `há ${diffYear} ${diffYear === 1 ? 'ano' : 'anos'}`;
    }
  }
}
