import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    Image,
    Platform,
    Vibration,
    Text
} from 'react-native';
import Slider from '@react-native-community/slider';

//draggable, rotatable, zoomable
import ElementContainer from './ElementContainer';
import {
    PanGestureHandler,
    State
} from 'react-native-gesture-handler';
import NotesRoomModal from './NotesRoomModal'
import RotateText from '../../../common/components/App/Project/AnimatedRerenders/RotateText';

//consts
import Colors from '../../../common/consts/Colors';

//icon
import Fontisto from 'react-native-vector-icons/Fontisto';

//redux imports
import { connect } from 'react-redux';
import { setShowOptions, setFlips } from '../../../actions/OptionActions'
import { useMemoOne } from 'use-memo-one';

function ItemElement({
    setIsDragging,
    setIsDraggingIndex,
    setIsElementTrashable,
    id,
    setZoomDeleteIcon,
    children,
    showOptions,
    setParentOptions,
    itemImage,
    isCarpentryVisible,
    isElectricalVisible,
    isPlumbingVisible,
    isDoorsVisible,
    isWindowsVisible,
    isAirConditioningVisible,
    isFireServicesVisible,
    isGlazingVisible,
    isMiscVisible,
    flips,
    setFlips,
    childrenElements
}) {
    const [dimensions, setDimensions] = useState({
        WIDTH: Dimensions.get('window').width,
        HEIGHT: Dimensions.get('window').height
    });
    const [notes, setNotes] = useState('');
    const [notesModal, setNotesModal] = useState(false);

    useEffect(() => {
        if (showOptions.selectedOption === 'notes' && showOptions.id === id) {
            setNotesModal(true);
        }
    }, [showOptions.selectedOption]);

    //adding event listner so that on orientation change can be listened
    useEffect(() => {
        //adding event listner
        Dimensions.addEventListener('change', changeCurrentDimensions);
        return () => {
            //remove event listner 
            //clean up
            Dimensions.removeEventListener('change', changeCurrentDimensions);
        };
    }, []);

    function changeCurrentDimensions() {
        setDimensions({
            ...dimensions,
            WIDTH: Dimensions.get('window').width,  //current width updated
            HEIGHT: Dimensions.get('window').height //current height updated
        });
    }

    let { resizeOffset } = useMemoOne(() => ({
        resizeOffset: {
            x: 0,
            y: 0
        }
    }))

    const { rotate, resizeX, resizeY } = useMemoOne(() => ({
        rotate: new Animated.Value(0),
        resizeX: new Animated.Value(0),
        resizeY: new Animated.Value(0),
    }), []);

    const animatedHeight = resizeY.interpolate({
        inputRange: [0, 300],
        outputRange: [50, 300]
    })
    const animatedWidth = resizeX.interpolate({
        inputRange: [0, 300],
        outputRange: [50, 300]
    })

    const animatedHeightIOS = resizeX.interpolate({
        inputRange: [0, 300],
        outputRange: [50, 300]
    })
    const animatedWidthIOS = resizeY.interpolate({
        inputRange: [0, 300],
        outputRange: [50, -150]
    })

    const rotateStr = rotate.interpolate({

        //blocking the degrees at 90*n degrees
        inputRange: [0, 80, 90, 100, 170, 180, 190, 260, 270, 280, 360],
        outputRange: ['0deg', '90deg', '90deg', '90deg', '180deg', '180deg', '180deg', '270deg', '270deg', '270deg', '360deg'],
    });

    function onHandlerStateChangeResize(event, position) {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            resizeOffset = {
                x: resizeOffset.x + event.nativeEvent.translationX,
                y: resizeOffset.y + event.nativeEvent.translationY
            }
            resizeX.extractOffset();
            resizeY.extractOffset();
        }
    }
    const onResizeGestureEvent = Animated.event(
        [
            {
                nativeEvent: {
                    translationX: resizeX,
                    translationY: resizeY,
                },
            },
        ],
        { useNativeDriver: false }
    );
    return (
        <View style={{ alignItems: 'center', display: (!id.includes('doors') && !id.includes('windows')) ? getDisplayValue() : 'flex' }}>

            <ElementContainer
                setIsDragging={setIsDragging}
                setIsDraggingIndex={setIsDraggingIndex}
                setIsElementTrashable={setIsElementTrashable}
                id={id}
                setZoomDeleteIcon={setZoomDeleteIcon}
                isDraggable={showOptions.selectedOption === 'stretch' && showOptions.id === id ? false : true}
                isRotate={showOptions.selectedOption === 'rotateSlider' && showOptions.id === id ? true : false}
                isScalable={false}
            >
                {
                    (id.includes('doors') || id.includes('windows')) && (getDisplayValue() === 'none') && (
                        <View
                            style={[styles.itemId, {
                                // display: getDisplayValue()==='none'?'flex':'none'
                                display: 'flex'
                            }]}
                        >
                            <Text>{id.includes('doors') ? `D${getItemIndex('doors')}` : `W${getItemIndex('windows')}`}</Text>
                        </View>
                    )
                }
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                        // setShowRoomOptions(previousState => !previousState);
                        setParentOptions({
                            ...showOptions,
                            isVisible: true,
                            id,
                            selectedOption: ''
                        });
                    }}
                >
                    {/* children contains the item element */}
                    {/* {children} */}
                    <Animated.View style={{
                        height: Platform.OS === 'ios' ? (animatedHeightIOS) : (animatedHeight),
                        width: Platform.OS === 'ios' ? (animatedWidthIOS) : (animatedWidth),
                        padding: 5,
                        backgroundColor: showOptions.id === id ? Colors.primaryLight : 'transparent',
                        transform: [
                            {
                                rotate: rotateStr
                            },
                            {
                                rotateY: flips[id] ? '180deg' : '0deg'
                            }
                        ]

                    }}>
                        <Image
                            source={itemImage}
                            style={{ height: '100%', width: '100%' }}
                            resizeMode="contain"
                        />
                    </Animated.View>
                </TouchableOpacity>
                {
                    showOptions.selectedOption === 'rotateSlider' && showOptions.id === id && (
                        <View style={styles.sliderContainer}>
                            <RotateText
                                styles={styles}
                                rotateStr={rotateStr}
                            />
                            <Slider
                                minimumValue={0}
                                maximumValue={360}
                                style={{ height: 40, width: 150, alignSelf: 'center' }}
                                minimumTrackTintColor={Colors.primary}
                                thumbTintColor={Colors.primary}
                                maximumTrackTintColor="#000000"
                                // onSlidingComplete={() => { }}
                                // // value={eraserStrokeSize}
                                onValueChange={(value) => {
                                    if (value === 0 || value === 360 || value === 90 || value === 180 || value === 270)
                                        Vibration.vibrate(30);
                                    Animated.spring(rotate, {
                                        toValue: value,
                                        useNativeDriver: false,
                                        friction: 100
                                    }).start()
                                }}   //setting the value to state
                            />
                        </View>
                    )
                }
                {
                    showOptions.selectedOption === 'stretch' && showOptions.id === id && (
                        <PanGestureHandler
                            maxPointers={1}
                            minPointers={1}
                            enabled={true}
                            onGestureEvent={onResizeGestureEvent}
                            onHandlerStateChange={(evt) => { onHandlerStateChangeResize(evt, 'br') }}
                        >
                            <Animated.View style={[styles.resize, styles.resizeBR
                                , {
                                transform: [
                                    {
                                        rotate: '90deg'
                                    }
                                ]
                            }
                            ]} >
                                <Fontisto
                                    name="arrow-resize"
                                />
                            </Animated.View>
                        </PanGestureHandler>
                    )
                }
            </ElementContainer>

            <NotesRoomModal
                modalVisible={notesModal}
                setModalVisible={setNotesModal}
                notes={notes}
                setNotes={setNotes}
                showOptions={showOptions}
                setParentOptions={setParentOptions}
                id={id}
            />
        </View>
    )

    //get the display value
    //of the item
    //if any of the bottom 
    //button is selected
    function getDisplayValue() {
        if (!isCarpentryVisible && id.includes('carpentry')) return 'none';
        else if (!isPlumbingVisible && id.includes('plumbing')) return 'none';
        else if (!isElectricalVisible && id.includes('electrical')) return 'none';
        else if (!isDoorsVisible && id.includes('doors')) return 'none';
        else if (!isWindowsVisible && id.includes('windows')) return 'none';
        else if (!isAirConditioningVisible && id.includes('airConditioning')) return 'none';
        else if (!isGlazingVisible && id.includes('glazing')) return 'none';
        else if (!isMiscVisible && id.includes('misc')) return 'none';
        else if (!isFireServicesVisible && id.includes('fireServices')) return 'none';

        else return 'flex';
    }
    function getItemIndex(type) {
        let index = 0;
        let childrenLoop = childrenElements.filter(item => item.props.id.includes([type]));
        for (let i = 0; i < childrenLoop.length; i++) {
            const element = childrenLoop[i];
            if (element.props.id === id) {
                index = i + 1;
            }

        }
        return index;
    }

    function setFlipsNow() {
        setFlips({
            ...flips,
            [id]: !flips[id]
        })
    }
}

//this is the common component to generate
//any type of item


const styles = StyleSheet.create({
    itemId: {
        height: 30,
        width: 30,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 15,
        alignSelf: 'center',
        position: 'absolute',
        top: -32
    },
    optionsContainer: {
        padding: 5,
        // flexDirection: 'row',
        flexWrap: 'wrap',
        maxWidth: 360,
        justifyContent: 'center',
        position: 'absolute',
        maxHeight: 300
    },
    optionButton: {
        backgroundColor: Colors.textDark,
        // padding: 30,
        marginTop: 10,
        marginLeft: 10,
        // paddingHorizontal: 20,
        borderRadius: 4,
        width: 60,
        height: 60,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    optionButtonText: {
        color: '#fff',
        textAlign: 'center'
    },
    optionActive: {
        backgroundColor: Colors.primary
    },
    resize: {
        position: 'absolute',
        height: 20,
        width: 20,
        borderRadius: 4,
        backgroundColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
    },
    resizeTL: {
        left: 0,
    },
    resizeTR: {
        right: 0,
    },
    resizeBL: {
        bottom: 0
    },
    resizeBR: {
        ...Platform.select({
            ios: {
                bottom: -15,
                right: -15,
            },
            android: {
                bottom: 0,
                right: 0
            }
        })
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    degreeTextContainer: {
        height: 30,
        width: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        flexDirection: 'row',
        marginRight: 5
    },
    degreeText: {
        fontSize: 10,
        fontWeight: 'bold'
    },
})

const mapStateToProps = () => state => ({
    //current options state
    showOptions: state.Options.showOptions,

    //bottom options for visibility
    isCarpentryVisible: state.Options.isCarpentryVisible,
    isPlumbingVisible: state.Options.isPlumbingVisible,
    isElectricalVisible: state.Options.isElectricalVisible,
    isDoorsVisible: state.Options.isDoorsVisible,
    isWindowsVisible: state.Options.isWindowsVisible,
    isAirConditioningVisible: state.Options.isAirConditioningVisible,
    isFireServicesVisible: state.Options.isFireServicesVisible,
    isGlazingVisible: state.Options.isGlazingVisible,
    isMiscVisible: state.Options.isMiscVisible,

    //flips
    flips: state.Options.flips,

    //childrens
    childrenElements: state.Options.childrenElements
});

const mapDispatchToProps = () => dispatch => ({
    setParentOptions: (options) => dispatch(setShowOptions(options)),
    setFlips: (flips) => dispatch(setFlips(flips))
})

export default connect(mapStateToProps, mapDispatchToProps)(ItemElement)