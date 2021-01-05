import { Button } from "@material-ui/core";
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { red, grey } from '@material-ui/core/colors';

const ColorBtn = withStyles((theme) => ({
    root: {
      color: theme.palette.getContrastText(grey[200]),
      backgroundColor: grey[200],
      '&:hover': {
        backgroundColor: red[200],
      },
    },
  }))(Button);


export default function ButtonGrey(props) {


    return ( 
        <div>
        <ColorBtn>
            {props.children}
        </ColorBtn>
        </div>

    );
}