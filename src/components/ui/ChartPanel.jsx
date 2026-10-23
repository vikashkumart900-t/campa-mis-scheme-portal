import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from "chart.js";
import { useEffect, useRef } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

export default function ChartPanel({ title, type = "bar", data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data) {
      return undefined;
    }

    const chart = new ChartJS(canvasRef.current, {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: type === "line" || type === "doughnut" ? true : false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    return () => chart.destroy();
  }, [data, type]);

  return (
    <div className="chart-panel">
      <h3>{title}</h3>
      <div style={{ height: "260px" }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
