import { createRoot } from 'react-dom/client';
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './styles/index.scss';
import { App } from './App';
import { TodoProvider } from './components/TodoProvider';

const Root = () => {
  return (
    <TodoProvider>
      <App />
    </TodoProvider>
  );
};

createRoot(document.getElementById('root') as HTMLDivElement).render(<Root />);
