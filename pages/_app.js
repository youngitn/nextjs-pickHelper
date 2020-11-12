import { Provider } from 'react-redux'

import store from '../store'
import { SnackbarProvider } from 'notistack';
import { CookiesProvider } from 'react-cookie';

const MyApp = ({ Component, pageProps }) => {
  return (
    <Provider store={store}>
      <CookiesProvider>
        <SnackbarProvider maxSnack={2} anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}

          autoHideDuration={3000}

        >
          <Component {...pageProps} />
        </SnackbarProvider>
      </CookiesProvider>
    </Provider>
  )
}

export default MyApp