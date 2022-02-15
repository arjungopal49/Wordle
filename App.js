import React, {useEffect, useState} from "react";
import { StatusBar } from 'expo-status-bar';
import {Alert, StyleSheet, Text, View} from 'react-native';
import { colors, CLEAR, ENTER} from "./Wordle Assets/src/constants";
import Keyboard from "./Wordle Assets/src/components/Keyboard";
import {ScrollView} from "react-native-web";

const NUMBER_OF_TRIES = 6;

const copyArray = (arr) => {
  return [... arr.map((rows) => [...rows])];
};

export default function App() {
  const word = "arjun";
  const letters = word.split('');

  const [rows, setRows] = useState(new Array(NUMBER_OF_TRIES).fill(new Array(letters.length).fill("")));

  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);
  const [gameState, setGameState] = useState('playing');

  useEffect(() => {
    if (curRow > 0) {
      checkGameState();
    }
  })

  const checkGameState = () => {
    if (checkIfWon()) {
      Alert.alert("GAME OVER", "You win")
      setGameState('won')
      setTimeout(() => {
        clearBoard();
        }, 1000);
    } else if (checkIfLost()) {
      Alert.alert("GAME OVER", "You lose")
      setGameState('lost')
      setTimeout(() => {
        clearBoard();
      }, 1000);
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
        setCurRow(curRow+1);
        setCurCol(0);
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

  return (
    <View style={styles.container}>
      <StatusBar style="Light" />

      <Text style = {styles.title}>WORDLE</Text>

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
  }
});
