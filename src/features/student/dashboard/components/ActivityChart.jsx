import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ActivityChart({
  data,
  title = 'Weekly Activity',
  datasetLabel = 'Study Hours',
  emptyText = 'No activities logged yet.',
  color = 'rgba(169, 146, 228, 0.85)',
  borderColor = '#8f79cf',
}) {
  if (!data.length) {
    return (
      <section className="dashboard-section">
        <h3 className="dashboard-section-title">{title}</h3>
        <p className="dashboard-empty">{emptyText}</p>
      </section>
    );
  }

  const labels = data.map((point) => point.label);
  const values = data.map((point) => point.value);

  const chartData = {
    labels,
    datasets: [
      {
        label: datasetLabel,
        data: values,
        backgroundColor: color,
        borderColor,
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#4f3f6f',
        },
        grid: {
          color: 'rgba(190, 174, 232, 0.45)',
        },
      },
      x: {
        ticks: {
          color: '#4f3f6f',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <section className="dashboard-section dashboard-section-hover">
      <h3 className="dashboard-section-title">{title}</h3>
      <div className="chart-wrap">
        <Bar data={chartData} options={options} />
      </div>
    </section>
  );
}
