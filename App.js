import React, {useEffect, useState} from "react";
import { StatusBar } from 'expo-status-bar';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import { colors, CLEAR, ENTER} from "./Wordle Assets/src/constants";
import Keyboard from "./Wordle Assets/src/components/Keyboard";
import {ScrollView} from "react-native-web";
import firestore from '@react-native-firebase/firestore';

const playersCollection = firestore().collection('Players');
const lobbiesCollection = firestore().collection('Lobbies');


const NUMBER_OF_TRIES = 6;

const copyArray = (arr) => {
  return [... arr.map((rows) => [...rows])];
};

const usersCollection = firestore()
    .collection('Players')
    .get()
    .then(collectionSnapshot => {
      console.log('Total players: ', collectionSnapshot.size);
      collectionSnapshot
          .forEach(documentSnapshot => {
            console.log('Player ID: ', documentSnapshot.id,
                documentSnapshot.data());
          });
    });

export default function App() {

  const [currentScreen, setScreen] = useState("menu");
  const [score, setScore] = useState(50);
  const [hasPlayed, setPlayed] = useState(false);

  const word = "hello";
  const letters = word.split('');

  const [rows, setRows] = useState(new Array(NUMBER_OF_TRIES).fill(new Array(letters.length).fill("")));

  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);
  const [gameState, setGameState] = useState('playing');
  const [data, setData] = useState([]);

  const onPress = () => {
    if(true) {
      setScreen("game");
    }
    else {
      Alert.alert("YOU CANT", "you already played the game today")
    }
  }
  const onPress2 = () => {
    setScreen("menu");
  }

  useEffect(() => {
    if (curRow > 0) {
      checkGameState();
    }
  })

  const checkGameState = () => {
    if (checkIfWon()) {
      // setScore(32 + (curRow)*14))
      Alert.alert("GAME OVER", "You win")
      setGameState('won')
      setTimeout(() => {
        clearBoard();
        }, 1000);
      setScreen("result")
      setPlayed(true)
    } else if (checkIfLost()) {
      setScore(0)
      Alert.alert("GAME OVER", "You lose")
      setGameState('lost')
      setTimeout(() => {
        clearBoard();
      }, 1000);
      setScreen("result")
      setPlayed(true)
    }
  }

  const clearBoard = () => {
    const updatedRows = copyArray(rows);
    for (var i = 0; i < 6; i++) {
      for (var j = 0; j < 5; j++) {
        updatedRows[i][j] = "";
      }
    }
    setRows(updatedRows);
    setCurRow(0);
    setCurCol(0);
    setGameState('playing')
  }

  const checkIfWon = () => {
    const row = rows[curRow - 1];
    setScore(30 + ((6-curRow)*14))
    return row.every((letter, i) => letter === letters[i])
  }

  const checkIfLost = () => {
    return curRow === rows.length;
  }

  const onKeyPressed = (key) => {
    if (gameState !== "playing") {
      return;
    }

    const updatedRows = copyArray(rows);

    if (key === CLEAR) {
      const prevCol = curCol - 1;
      if (prevCol >= 0) {
        updatedRows[curRow][prevCol] = "";
        setRows(updatedRows);
        setCurCol(prevCol);
      }
      return;
    }

    if (key === ENTER) {
      if (curCol === rows[0].length) {

        const guess = rows[curRow].join("");
        console.log(guess);
        const url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + guess;

        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
              console.log(responseJson);
              if (responseJson["title"] === "No Definitions Found") {
                Alert.alert("SORRY", "This word does not exist")
                updatedRows[curRow][curCol - 1] = "";
                setRows(updatedRows);
                setCurCol(curCol - 1);
              } else {
                setCurRow(curRow+1);
                setCurCol(0);
              }
            })
            .catch((error) => {
              console.error(error);
            });

      }
      return;
    }

    if(curCol < rows[0].length) {
      updatedRows[curRow][curCol] = key;
      setRows(updatedRows);
      setCurCol(curCol+1);
    }
  }

  const isCellActive = (row, col) => {
    return row === curRow && col === curCol;
  }

  const getCellBGColor = ( row, col) => {
    const letter = rows[row][col];
    if (row >=  curRow) {
      return colors.black;
    }
    if (letter === letters[col]) {
      return colors.primary;
    }
    if (letters.includes(letter)) {
      return colors.secondary;
    }
    return colors.darkgrey;
  }

  const getAllLettersWithColor = (color) => {
    return rows.flatMap((row, i) => row.filter((cell, j) => getCellBGColor(i, j) === color));
  }

  const greenCaps = getAllLettersWithColor(colors.primary)
  const yellowCaps = getAllLettersWithColor(colors.secondary)
  const greyCaps = getAllLettersWithColor(colors.darkgrey)
  if(currentScreen === "menu"){
    return (
        <View style={styles.menuContainer}>
          <View>
            <Text style={styles.menuTittleText}>PUZLER</Text>
          </View>
          <TouchableOpacity
              style={styles.menuButton}
              onPress={onPress}
          >
            <Text style={styles.menuButtonText}>PLAY</Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={styles.menuButton}
          >
            <Text style={styles.menuButtonText}>SOCIAL</Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={styles.menuButton}
          >
            <Text style={styles.menuButtonText}>LEADERBOARD</Text>
          </TouchableOpacity>
        </View>
    );
  }
  else if(currentScreen === "game"){
    return (
        <View style={styles.container}>
          <StatusBar style="Light" />

          <Text style = {styles.title}>PUZLER</Text>

          <View style={styles.map}>

            {rows.map((row, i) => (
                <View  key = {`row-${i}`}  style={styles.row}>
                  {row.map((letter, j) => (
                      <View
                          key = {`cell-${i}-${j}`}
                          style={[styles.cell,
                            {
                              borderColor: isCellActive(i, j) ? colors.lightgrey: colors.darkgrey,
                              backgroundColor: getCellBGColor(i, j)

                            }]
                          }>

                        <Text style = {styles.cellText}>{letter.toUpperCase()}</Text>

                      </View>
                  ))}

                </View>
            ))}

          </View>

          <Keyboard onKeyPressed={onKeyPressed} greenCaps={greenCaps} yellowCaps={yellowCaps} greyCaps={greyCaps}/>
        </View>
    );
  }
  else if(currentScreen === "result") {
    return (
        <View style={styles.menuContainer}>
      <View>
        <Text style={styles.menuTittleText}>GOOD JOB</Text>
      </View>
          <View>
            <Text style={styles.subscript}>you got a score of score {score}</Text>
          </View>
      <TouchableOpacity
          style={styles.menuButton}
          onPress={onPress2}
      >
        <Text style={styles.menuButtonText}>BACK TO MENU</Text>
      </TouchableOpacity>

    </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: colors.lightgrey,
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 7,
    marginTop:50
  },

  map: {
    alignSelf: "stretch",
    marginVertical: 20,
    height: 100
  },
  row:{
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center"
  },
  cell:{
    borderWidth: 3,
    backgroundColor: colors.darkgrey,
    flex: 1,
    maxWidth: 70,
    aspectRatio: 1,
    margin: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  cellText: {
    color: colors.lightgrey,
    fontWeight: "bold",
    fontSize: 28,
  },menuContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
    backgroundColor: "#111111"

  },
  menuButton: {
    alignItems: "center",
    backgroundColor: "#fa9819",
    padding: 40,
    marginHorizontal: 20,
    height: 20,
    marginTop: 40,

  },
  menuTittleText: {
    fontSize:70,
    marginTop:0,
    marginBottom:20,
    alignItems: 'center',
    textAlign:'center',
    color:"#dddddd"
  },
  subscript: {
    fontSize:30,
    marginTop:0,
    marginBottom:20,
    alignItems: 'center',
    textAlign:'center',
    color:"#dddddd"
  },
  menuButtonText: {
    fontFamily: "Courier New",
    position: 'relative',
    height: 20,
    fontSize:20,
    alignItems: 'center',
    justifyContent: 'center',

  }
});
