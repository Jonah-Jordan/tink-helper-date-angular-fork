'use strict';
(function(module) {
  try {
    module = angular.module('tink.datehelper');
  } catch (e) {
    module = angular.module('tink.datehelper', ['tink.formathelper']);
  }
  module.factory('calView',['dateCalculator',function (dateCalculator) {
  function isSameDate(a, b) {
    if (angular.isDate(a) && angular.isDate(b)) {
      a.setHours(0,0,0,0);
      b.setHours(0,0,0,0);
      return a.getTime() === b.getTime();
    } else {
      return false;
    }
  }
  function inRange(date, first, last) {

    if (angular.isDate(first) && angular.isDate(last) && angular.isDate(date)) {
      date.setHours(0,0,0,0);
      first.setHours(0,0,0,0);
      last.setHours(0,0,0,0);
      if (date > first && date < last) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  function mod(n, m) {
    return ((n % m) + m) % m;
  }
  function callCullateData(date) {

    var year = date.getFullYear(),
    month = date.getMonth();

    var firstDayOfMonth = new Date(year, month, 1);
    var firstDayOfWeek = new Date(+firstDayOfMonth - mod(firstDayOfMonth.getDay() - 1, 7) * 864e5);


    var offsetDayOfMonth = firstDayOfMonth.getTimezoneOffset();
    var offsetDayOfweek = firstDayOfWeek.getTimezoneOffset();

    if (offsetDayOfMonth !== offsetDayOfweek) {
      firstDayOfWeek = new Date(+firstDayOfWeek + (offsetDayOfweek - offsetDayOfMonth) * 60e3);
    }

    var daysToDraw = dateCalculator.daysInMonth(date) + dateCalculator.daysBetween(firstDayOfWeek, firstDayOfMonth);
    if (daysToDraw % 7 !== 0) {
      daysToDraw += 7 - (daysToDraw % 7);
    }

    return {days: daysToDraw, firstDay: firstDayOfWeek};
  }

  function split(arr, size) {
    var arrays = [];
    while(arr.length > 0) {
      arrays.push(arr.splice(0, size));
    }
    return arrays;
  }

  function daysInRows(date,selectedDate,before,after){
    var monthCall = callCullateData(date);
    var today = new Date();
    var days = [], day;
      for(var i = 0; i < monthCall.days; i++) { // < 7 * 6

        day = new Date(monthCall.firstDay.getFullYear(), monthCall.firstDay.getMonth(), monthCall.firstDay.getDate() + i);
        var isMuted = false;
        if(day.getMonth() !== date.getMonth()){
          isMuted = true;
        }
        var isSelected = false;
        if(angular.isDate(selectedDate)){
          isSelected = selectedDate.toDateString() === day.toDateString();
        }

        var disable = false;
        if(angular.isDate(before) && !dateCalculator.dateBeforeOther(day,before)){
          disable = true;
        }
        if(angular.isDate(after) && !dateCalculator.dateBeforeOther(after,day)){
          disable = true;
        }

        days.push({date: day,selected:isSelected, isToday: day.toDateString() === today.toDateString(), label: dateCalculator.formatDate(day, 'd'),isMuted:isMuted,disabled:disable});
    }
    var arrays = split(days, 7);
     return arrays;

  }

  function monthInRows(date,before,after){
    var months = [];
    var monthDate;
    if(angular.isDefined(before) && before !== null){
      before = new Date(before.getFullYear(),before.getMonth(),1);
    }
    if(angular.isDefined(after) && after !== null){
      after = new Date(after.getFullYear(),after.getMonth(),1);
    }
     for(var i = 0; i < 12; i++) {
      monthDate = new Date(date.getFullYear(),i,1);

    var disable = false;
    if(angular.isDate(before) && !dateCalculator.dateBeforeOther(monthDate,before)){
      disable = true;
    }
    if(angular.isDate(after) && !dateCalculator.dateBeforeOther(after,monthDate)){
      disable = true;
    }

      months.push({date: monthDate,label: dateCalculator.formatDate(monthDate, 'mmm'),disabled:disable});
     }
    var arrays = split(months, 4);
    return arrays;
  }

  function yearInRows(date,before,after){
    var years = [];
    var yearDate;

    if(angular.isDefined(before) && before !== null){
      before = new Date(before.getFullYear(),date.getMonth(),1);
    }
    if(angular.isDefined(after) && after !== null){
      after = new Date(after.getFullYear(),date.getMonth(),1);
    }

   for(var i = 11; i > -1; i--) {
    yearDate = new Date(date.getFullYear()-i,date.getMonth(),1);

    var disable = false;
    if(angular.isDate(before) && !dateCalculator.dateBeforeOther(yearDate,before)){
      disable = true;
    }
    if(angular.isDate(after) && !dateCalculator.dateBeforeOther(after,yearDate)){
      disable = true;
    }

    years.push({date: yearDate,label: dateCalculator.formatDate(yearDate, 'yyyy'),disabled:disable});
   }
    var arrays = split(years, 4);
    return arrays;
  }

  function createLabels(date, firstRange, lastRange,grayed,before,after) {
    var label = '',cssClass = '';
    if (label !== null && angular.isDate(date)) {
      label = date.getDate();
      if(grayed){
        cssClass = 'btn-grayed';
      }
      if (isSameDate(date, firstRange) || isSameDate(date, lastRange)) {
        if(grayed){
          cssClass = 'btn-grayed-selected-clicked';
        }else{
          cssClass = 'btn-selected-clicked';
        }
      } else if (inRange(date, firstRange, lastRange)) {
        if(grayed){
          cssClass = 'btn-grayed-selected';
        }else{
          cssClass = 'btn-selected';
        }
      } else if (isSameDate(date, new Date())) {
        if(grayed){
          cssClass = 'btn-grayed';
        }else{
          cssClass = 'btn-today';
        }
      }

      var disable = '';
      if(angular.isDate(before) && !dateCalculator.dateBeforeOther(date,before)){
        disable = 'disabled';
      }
      if(angular.isDate(after) && !dateCalculator.dateBeforeOther(after,date)){
        disable = 'disabled';
      }

      var month = ('0' + (date.getMonth() + 1)).slice(-2);
      var day = ('0' + (date.getDate())).slice(-2);
      return '<td><button '+disable+' ng-click="$select(\''+date.getFullYear()+'/'+month+'/'+day+'\')" class="btn ' + cssClass + '"><span>' + label + '</span></button></td>';
    } else{
      return '<td></td>';
    }

       }

      return {
        createMonthDays: function (date, firstRange, lastRange,control,before,after) {
          var domElem = '', monthCall = callCullateData(date), label;
          //var tr = createTR();
          var tr = '<tr>';
          for (var i = 0; i < monthCall.days; i++) {
            var day = new Date(monthCall.firstDay.getFullYear(), monthCall.firstDay.getMonth(), monthCall.firstDay.getDate() + i);
            label = createLabels(null, firstRange, lastRange,false,before,after);
            if(control === 'prevMonth'){
              if(day.getMonth() !== date.getMonth() && dateCalculator.dateBeforeOther(date,day)){
                label = createLabels(day, firstRange, lastRange,true,before,after);
              }
            } else if(control === 'nextMonth'){
              if(day.getMonth() !== date.getMonth() && dateCalculator.dateBeforeOther(day,date)){
                label = createLabels(day, firstRange, lastRange,true,before,after);
              }
            }
            if(day.getMonth() === date.getMonth()){
              label = createLabels(day, firstRange, lastRange,false,before,after);
            }

            //tr.appendChild(label);
            tr += label;
            if ((i + 1) % 7 === 0) {
              tr += '</tr>';
              domElem += tr;
              tr = '<tr>';
              //tr = createTR();
            }
          }
          domElem = '<tbody id="secondCal">' + domElem + '</tbody>';
          return domElem;


        },
        daysInRows: function(date,model,before,last){
         return daysInRows(date,model,before,last);
        },
        monthInRows:function(date,before,last){
          return monthInRows(date,before,last);
        },
        yearInRows:function(date,before,last){
          return yearInRows(date,before,last);
        }
      };
    }]);
})();