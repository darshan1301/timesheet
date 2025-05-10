// LiveClock.jsx
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-gray-400 mb-8">
      <Clock className="w-5 h-5" />
      <span className="text-xl font-medium">{now.toLocaleTimeString()}</span>
    </div>
  );
}
