import { useEffect } from "react";
import axios from "axios";

function App() {

  useEffect(() => {
    // Test backend connection
    axios.get("http://localhost:5000/")
      .then(res => console.log(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>UniHub Frontend Running 🚀</h1>
      <p>Check your browser console for backend response.</p>
    </div>
  );
}

export default App;
