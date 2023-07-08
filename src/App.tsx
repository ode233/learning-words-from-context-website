import { Provider } from 'react-redux';
import { store } from './redux/store';
import LocalVideoPlayer from './components/localVideoPlayer/LocalVideoPlayer';

function App() {
    return (
        <Provider store={store}>
            <LocalVideoPlayer></LocalVideoPlayer>
        </Provider>
    );
}

export default App;
