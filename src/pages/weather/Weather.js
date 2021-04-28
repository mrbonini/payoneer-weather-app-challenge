import React, { useCallback, useEffect, useMemo } from 'react';
import { Button, Card, CardActionArea, CardContent, Container, FormControlLabel, Grid, Icon, IconButton, makeStyles, Radio, RadioGroup, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import Loading from './components/Loading';
import * as actions from './slice/actions';
import { selectWeatherData, selectWeatherView } from './slice/selector';
import { isDesktop } from "react-device-detect";
import { animateScroll as scroll } from 'react-scroll';
import WeatherImage from '../../assets/weather.jpeg';
import moment from 'moment';

const styles = makeStyles({
    root: {
        padding: isDesktop ? '2em 10em' : '2em',
        background: 'aliceblue',
        height: '100%'
    },
    section: {
        margin: '2em 0'
    },
    cardBody: {
        position: 'relative',
    },
    cardContent: {
        marginTop: '2em',
        marginBottom: '2em'
    },
    cardImage: {
        height: '100%', 
        position: 'absolute', 
        maxWidth: '-webkit-fill-available', 
        top: 0, 
        left: 0, 
        opacity: 0.5, 
    },
    pageButton: {
        padding: 0
    },
    barContainer: {
        position: 'relative', 
        height: '200px', 
        width: 'auto', 
        border: '1px solid black', 
        marginBottom: '1em'
    },
    text: {
        textAlign: 'center'
    }
});

export default function Weather(props) {
    const dispatch = useDispatch();
    const classes = styles();

    const pageSize = 3;
    
    const view = useSelector(selectWeatherView);
    const data = useSelector(selectWeatherData);

    const handleChange = useCallback((e) => {
        dispatch(actions.controlData({selectedTemperature: e.target.value}))
    }, []);

    const handleCarousel = useCallback((direction) => {
        let newPage = null;
        dispatch(actions.controlData({barCharts: []}));
        dispatch(actions.controlView({selectedCard: null}));
        if ( direction === 'previous' ) {
            newPage = +view.page - 1
            return dispatch(actions.controlView({page: newPage}))
        }
        newPage = +view.page + 1
        dispatch(actions.controlView({page: newPage}))
    }, [view.page]);

    const cardsByDay = useMemo(() => {
        const cardsByDay = {};
        data?.list?.forEach(info => {
            if( Object.keys(cardsByDay)?.length ) {
                const foundDate = Object.keys(cardsByDay).find(day => {
                    return moment(day).isSame(moment(info.dt_txt.split(' ')[0]))
                });
                return foundDate 
                    ? cardsByDay[foundDate].push(info) 
                    : cardsByDay[info.dt_txt.split(' ')[0]] = [info];
            } else cardsByDay[info.dt_txt.split(' ')[0]] = [info]
        });
        
        return cardsByDay
    }, [data.list]);

    const maxPage = useMemo(() => {
        return Math.round(Object.keys(cardsByDay).length/pageSize);
    }, [pageSize, cardsByDay])

    const cardsToRender = useMemo(() => {
        const cardsArr = []
        
        Object.keys(cardsByDay).forEach((cardDate, i) => {
            if (pageSize * view.page <= i && cardsArr.length < pageSize) {
                cardsArr.push({[cardDate]: cardsByDay[cardDate]})
            }
        });

        return cardsArr
    }, [cardsByDay, view.page]);

    useEffect(() => {
        dispatch(actions.getWeatherData(data.selectedTemperature))
    }, [data.selectedTemperature]);

    return (
        view.isLoading ?
        <Loading />
        : view.hasError ?
        <Loading hasError={view.error} />
        : <Container className={classes.root} maxWidth='xl'>
            <Grid className={classes.section} container direction='row' justify='space-between' alignItems='center'>
                <RadioGroup value={data.selectedTemperature} onChange={handleChange} >
                    <FormControlLabel value="celcius" control={<Radio color='primary' />} label="Celcius" />
                </RadioGroup>
                <RadioGroup value={data.selectedTemperature} onChange={handleChange} >
                    <FormControlLabel value="fahrenheit" control={<Radio color='primary' />} label="Fahrenheit" labelPlacement='start' />
                </RadioGroup>
            </Grid>
            <Grid className={classes.section} container direction='row' justify='space-between' alignItems='center'>
                {
                    view.page === 0 ? <span/> 
                    : 
                    <IconButton className={classes.pageButton} onClick={() => handleCarousel('previous')}>
                        <Icon className='fas fa-arrow-left' color='primary' />
                    </IconButton>
                }
                {
                    +view.page + 1 >= maxPage ? <span /> 
                    : 
                    <IconButton className={classes.pageButton} onClick={() => handleCarousel('next')}>
                        <Icon className='fas fa-arrow-right' color='primary' />
                    </IconButton>
                }
            </Grid>
            <Grid className={classes.section} container direction='row' justify='space-evenly' alignItems='center' spacing={2}>
                {
                    cardsToRender?.length &&
                    cardsToRender.map((card, idx) => {
                        const firstCard = card[Object.keys(card)[0]][0];

                        return (
                            <Grid 
                                key={`card-${idx}`}
                                item 
                                xs={10} sm={7} md={3}
                                style={{
                                    opacity: view.selectedCard === idx ? 0.5 : 1
                                }}
                                onClick={() => {
                                    dispatch(actions.controlData({barCharts: card[Object.keys(card)[0]]}));
                                    dispatch(actions.controlView({selectedCard: idx}));
                                    scroll.scrollToBottom();
                                }}
                            >
                                <WeatherCard 
                                    date={firstCard.dt_txt.split(' ')[0]}
                                    mainWeather={
                                        firstCard.weather[0]?.main === 'Clouds' ? 'fas fa-cloud' 
                                        : firstCard.weather[0]?.main === 'Rain' ? 'fas fa-cloud-rain'
                                        : 'fas fa-sun'
                                    }
                                    temp={`${firstCard.main.temp}°${data.selectedTemperature === 'celcius' ? 'C' : 'F'}`}
                                    humidity={`${firstCard.main.humidity}%`}
                                    maxTemp={`${firstCard.main.temp_max}°${data.selectedTemperature === 'celcius' ? 'C' : 'F'}`}
                                    minTemp={`${firstCard.main.temp_min}°${data.selectedTemperature === 'celcius' ? 'C' : 'F'}`}
                                />
                            </Grid>
                        )
                    })
                }
            </Grid>
            <Grid className={classes.section} container direction='row' justify='space-evenly' alignItems='center' spacing={1}>
                {
                    data?.barCharts?.length ?
                    data.barCharts.map((bar, idx) => {
                        const percentage = data.selectedTemperature === 'celcius' ? bar.main.temp : (bar.main.temp - 32) * (5 / 9)
                        
                        return <Grid item xs={1} key={`bar-chart-${idx}`} >
                            <WeatherBarCharts
                                time={bar.dt_txt.split(' ')[1]}
                                percentage={percentage}
                                temp={`${isDesktop ? bar.main.temp : Math.round(bar.main.temp)}° ${data.selectedTemperature === 'celcius' ? 'C' : 'F'}`}
                            />
                        </Grid>
                    })
                    : null
                }
                <Grid container item direction='row' justify='center' xs={12}>
                    {
                        data?.barCharts?.length && !isDesktop ?
                        <Button variant='contained' color='primary' onClick={() => scroll.scrollToTop()}>
                            Back to top
                        </Button>
                        : null
                    }
                </Grid>
            </Grid>
        </Container>
    )
};

function WeatherBarCharts(props) {
    const { percentage, temp, time } = props;
    const classes = styles();

    return (
        <>
            <Typography style={{textAlign: 'center'}}>
                {time}
            </Typography>
            <div className={classes.barContainer}>
                <div style={{
                    height: percentage < 0 ? `${percentage * -1}%` : `${percentage}%`,
                    background: percentage < 0 ? 'blue' : 'red',
                    width: '100%',
                    position: 'absolute',
                    bottom: percentage < 0 ? null : 0,
                    top: percentage > 0 ? null : 0
                }}
                />
            </div>
            <Typography style={{textAlign: 'center'}}>
                {temp}
            </Typography>
        </>
    )
}

function WeatherCard(props) {
    const { date, temp, humidity, maxTemp, minTemp, mainWeather } = props
    const classes = styles();

    return (
        <Card raised className={classes.cardBody}>
            <CardActionArea>
                <CardContent>
                    <img src={WeatherImage} className={classes.cardImage} />
                    <Grid className={classes.cardContent} container direction='row' justify='center' alignItems='flex-start' spacing={3}>
                        <Grid item xs={12} className={classes.text}>
                            <Typography variant='h4'>
                                Munich, DE <Icon style={{width: '2em'}} className={mainWeather} />
                            </Typography>
                        </Grid>
                        <Grid item xs={12} />
                        <Grid item xs={12}>
                            <Typography className={classes.text}> {date} </Typography>
                        </Grid>
                        <Grid item container direction='row' justify='center' alignItems='center' xs={12}>
                            <Grid item xs={6}>
                                <Typography className={classes.text}> 
                                    <Icon className='fas fa-tint' /> {humidity} 
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography className={classes.text}> 
                                    <Icon className='fas fa-temperature-low' /> 
                                    {temp} 
                                </Typography>
                            </Grid>
                        </Grid>
                        
                        <Grid item xs={12} className={classes.text}>
                            <b>Max temperature:</b>
                        </Grid>
                        <Typography className={classes.text}> {maxTemp} </Typography>
                        <Grid item xs={12} className={classes.text}>
                            <b>Min temperature:</b>
                        </Grid>
                        <Typography className={classes.text}> {minTemp} </Typography>
                    </Grid>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}