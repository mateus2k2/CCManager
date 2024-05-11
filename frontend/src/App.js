import React, { useEffect, useState } from 'react';

function App() {
  const [backendData, setBackendData] = useState([]);

  useEffect(() => {
    fetch('/api')
      .then(res => res.json())
      .then(data => setBackendData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      {backendData.length === 0 ? (
        <p>Loading...</p>
      ) : (
        backendData.users.map((user, index) => (
          <div key={index}>
            <p key={index}>{user}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;


// function App() {

//   return (
//     <div>
//       TESTE
//       TESTE
//       TESTE
//       TESTE
//       TESTE
//     </div>
//   );
// }

// export default App;
