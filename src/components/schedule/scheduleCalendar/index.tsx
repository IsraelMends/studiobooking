import React from 'react';
import { Calendar } from 'react-native-calendars';

import { ScheduleCalendarProps } from '~/types/schedule/schedule.types';
import { isPastDate } from '~/utils/schedule';

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  selectedDate,
  onDayPress,
  minDate,
}) => {
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