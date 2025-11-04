import React from 'react';
import { Calendar, LocaleConfig } from 'react-native-calendars';

import { ScheduleCalendarProps } from '~/types/schedule/schedule.types';
import { isPastDate } from '~/utils/schedule';

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  selectedDate,
  onDayPress,
  minDate,
}) => {
  // Locale PT-BR para títulos de meses e dias
  LocaleConfig.locales['pt-br'] = {
    monthNames: [
      'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
    ],
    monthNamesShort: [
      'Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'
    ],
    dayNames: [
      'Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'
    ],
    dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
    today: 'Hoje',
  } as any;
  LocaleConfig.defaultLocale = 'pt-br';

  const handleDayPress = (day: { dateString: string }) => {
    if (isPastDate(day.dateString)) return;
    onDayPress(day);
  };

  return (
    <Calendar
      minDate={minDate}
      onDayPress={handleDayPress}
      markedDates={{ [selectedDate]: { selected: true, selectedColor: '#20232a' } }}
      theme={{
        backgroundColor: '#0b0f13',
        calendarBackground: '#0b0f13',
        textSectionTitleColor: '#ffffff',
        textSectionTitleDisabledColor: '#9aa0a6',
        selectedDayBackgroundColor: '#20232a',
        selectedDayTextColor: '#ffffff',
        todayTextColor: '#10b981',
        dayTextColor: '#ffffff',
        textDisabledColor: '#555555',
        dotColor: '#9aa0a6',
        selectedDotColor: '#ffffff',
        arrowColor: '#ffffff',
        disabledArrowColor: '#555555',
        monthTextColor: '#ffffff',
        indicatorColor: '#20232a',
        textDayFontWeight: '300',
        textMonthFontWeight: 'bold',
        textDayHeaderFontWeight: '300',
        textDayFontSize: 16,
        textMonthFontSize: 18,
        textDayHeaderFontSize: 14,
      }}
      hideExtraDays
      enableSwipeMonths
      accessibilityLabel={`Calendário - Data selecionada: ${selectedDate}`}
    />
  );
};