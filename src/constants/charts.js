import de from 'apexcharts/dist/locales/de.json';

export const BAR_CHART = {
  BASE: {
    options: {
      chart: {
        type: 'bar',
        toolbar: {
          show: false,
        },
      },
      colors: ['#004e7b', '#DEDC00'],
      dataLabels: {
        enabled: false,
      },
      fill: {
        opacity: 1,
      },
      legend: {
        offsetY: -8,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          endingShape: 'flat',
        },
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      subtitle: {
        align: 'center',
      },
      title: {
        align: 'center',
        style: {
          fontSize: '14px',
          color: '#424242',
        },
      },
      xaxis: {
        type: 'datetime',
        tickPlacement: 'on',
        labels: {
          datetimeFormatter: {
            year: 'yyyy',
            month: 'MMM \'yy',
            day: 'dd MMM',
            hour: 'HH:mm',
          },
        },
      },
      yaxis: {
        tickAmount: 4,
      },
    },
    series: [
      {
        data: [],
      },
      {
        data: [],
      },
    ],
  },
  DE: {
    chart: {
      locales: [de],
      defaultLocale: 'de',
    },
    series: [
      {
        name: 'Seitenaufrufe',
      },
      {
        name: 'Navigationsereignisse',
      },
    ],
  },
  EN: {
    series: [
      {
        name: 'Page views',
      },
      {
        name: 'Navigation events',
      },
    ],
  },
};

export const OVERALL_USAGE_CHART = {
  DE: {
    options: {
      title: {
        text: 'Gesamtnutzung',
      },
      tooltip: {
        x: {
          format: 'dd.MM.yyyy HH:mm',
        },
      },
      noData: {
        text: 'Keine Daten vorhanden',
      },
    },
  },
  EN: {
    options: {
      title: {
        text: 'Overall usage',
      },
      tooltip: {
        x: {
          format: 'dd/MM/yyyy HH:mm',
        },
      },
      noData: {
        text: 'No data available',
      },
    },
  },
};

export const SITE_USAGE_CHART = {
  DE: {
    options: {
      title: {
        text: 'Websitenutzung',
      },
      tooltip: {
        x: {
          format: 'dd/MM/yyyy HH:mm',
        },
      },
    },
  },
  EN: {
    options: {
      title: {
        text: 'Website usage',
      },
      tooltip: {
        x: {
          format: 'dd/MM/yyyy HH:mm',
        },
      },
    },
  },
};

export const PIE_CHART = {
  BASE: {
    options: {
      chart: {
        type: 'pie',
      },
      labels: [],
      legend: {
        position: 'bottom',
      },
      plotOptions: {
        pie: {
          dataLabels: {
            offset: -10,
          },
        },
      },
      title: {
        align: 'center',
        style: {
          fontSize: '14px',
          color: '#424242',
        },
      },
    },
    series: [],
  },
  DE: {},
  EN: {},
};

export const TOP_5_EVENTS = {
  DE: {
    options: {
      title: {
        text: 'Top 5 Navigationsereignisse',
      },
    },
  },
  EN: {
    options: {
      title: {
        text: 'Top 5 navigation events',
      },
    },
  },
};

export const TOP_5_WEBSITES = {
  DE: {
    options: {
      title: {
        text: 'Top 5 der besuchten Webseiten ',
      },
    },
  },
  EN: {
    options: {
      title: {
        text: 'Top 5 of visited websites',
      },
    },
  },
};

export const TIME_RANGES = {
  DE: [
    {
      text: 'heute',
      value: 'today',
    },
    {
      text: 'gestern',
      value: 'yesterday',
    },
    {
      text: 'aktuelle Woche',
      value: 'currentWeek',
    },
    {
      text: 'letzte Woche',
      value: 'lastWeek',
    },
    {
      text: 'aktueller Monat',
      value: 'currentMonth',
    },
    {
      text: 'letzter Monat',
      value: 'lastMonth',
    },
  ],
  EN: [
    {
      text: 'today',
      value: 'today',
    },
    {
      text: 'yesterday',
      value: 'yesterday',
    },
    {
      text: 'current week',
      value: 'currentWeek',
    },
    {
      text: 'last week',
      value: 'lastWeek',
    },
    {
      text: 'current month',
      value: 'currentMonth',
    },
    {
      text: 'last month',
      value: 'lastMonth',
    },
  ],
};
