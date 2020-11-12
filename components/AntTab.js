import Tab from '@material-ui/core/Tab';
import {
    withStyles,
    makeStyles,
} from '@material-ui/core/styles';
import { PlayCircleFilledWhite } from '@material-ui/icons';
const AntTab = withStyles((theme) => ({
    root: {
        border: '1px solid red',
        textTransform: 'none',
        color: 'black',
        minWidth: 100,
        //fontSize: '15px',
        //fontWeight: theme.typography.fontWeightRegular,
        marginRight: theme.spacing(0),
        // fontFamily: [
        //     '-apple-system',
        //     'BlinkMacSystemFont',
        //     '"Segoe UI"',
        //     'Roboto',
        //     '"Helvetica Neue"',
        //     'Arial',
        //     'sans-serif',
        //     '"Apple Color Emoji"',
        //     '"Segoe UI Emoji"',
        //     '"Segoe UI Symbol"',
        // ].join(','),
        fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
        fontSize: '1rem',
        '&:hover': {
        color: 'red',
        backgroundColor: '#D6D5D4',
        opacity: 1,
    },
        '&$selected': {
        backgroundColor: 'red',
        color: 'white',
        fontWeight: theme.typography.fontWeightMedium,
    },
        '&:focus': {
        color: 'white',
    },
        },
    selected: { },
    })) ((props) => <Tab disableRipple {...props} />);

export default AntTab;