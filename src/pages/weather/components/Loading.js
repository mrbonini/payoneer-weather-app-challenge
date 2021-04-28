import React from 'react'
import { Container, Grid, makeStyles } from '@material-ui/core'

const styles = makeStyles({
    root: {
        height: '100vh'
    }
});

export default function Loading(props) {
    const classes = styles();
    const { hasError } = props;
    
    return (
        <Container maxWidth='xl'>
            <Grid className={classes.root} container direction='row' justify='center' alignItems='center'>
                { hasError ? hasError : 'LOADING...' }
            </Grid>
        </Container>
    )
}