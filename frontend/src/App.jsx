import { useEffect, useState } from "react";

function App() {
  const [apiMessage, setApiMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.json())
      .then((data) => setApiMessage(data.message))
      .catch((err) => console.error("Erreur API:", err));
  }, []);

  return (
    <div>
      <h1>BeautyConnect</h1>
      <p>{apiMessage}</p>
    </div>
  );
}

export default App;