import 'modern-css-reset';
import ReactDOM from 'react-dom/client';

// Your top-level component or App component
import App from './App';

// Create a root and render your application inside it
const root = document.getElementById('root') as HTMLElement;
ReactDOM.createRoot(root).render(<App />);
