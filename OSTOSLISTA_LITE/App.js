import { StatusBar } from "expo-status-bar";
import { StyleSheet, TextInput, Text, View, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Button } from "react-native";
import { useState, useEffect } from "react";
import * as SQLite from 'expo-sqlite';

const openDatabaseAsync = async () => {
  return await SQLite.openDatabaseAsync('ostoslista.db');
};

export default function App() {
  const [db, setDb] = useState(null);
  const [data, setData] = useState([]);
  const [food, setFood] = useState("");
  const [maara, setMaara] = useState("");
  const [firstUnderlineColor, setFirstUnderlineColor] = useState("grey");
  const [secondUnderlineColor, setsecondUnderlineColor] = useState("grey");

  useEffect(() => {
    const setupDatabase = async () => {
      const database = await openDatabaseAsync();
      setDb(database);

      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS ostoslista (id INTEGER PRIMARY KEY AUTOINCREMENT, product TEXT, quantity TEXT);
        
      `);  
      const allRows = await database.getAllAsync('SELECT * FROM ostoslista');
      setData(allRows);
      // console.log('Tietokannan rivit:', allRows);
    };

    setupDatabase();
  }, []);

  const handleFirstFocus = () => {
    setFirstUnderlineColor("#03fcfc");
  };

  const handleFirstBlur = () => {
    setFirstUnderlineColor("grey");
  };

  const handleSecondFocus = () => {
    setsecondUnderlineColor("#03fcfc");
  };

  const handleSecondBlur = () => {
    setsecondUnderlineColor("grey");
  };

  const addItemToDatabase = async () => {
    if (food && maara && db) {
      const result = await db.runAsync('INSERT INTO ostoslista (product, quantity) VALUES (?, ?)', food, maara);
      
      setData([...data, { id: result.lastInsertRowId, product: food, quantity: maara }]);
      setFood("");
      setMaara("");
    }
  };

  const removeItemFromDatabase = async (id) => {
    if (db) {
      await db.runAsync('DELETE FROM ostoslista WHERE id = ?', id);
      
      setData(prevData => prevData.filter(item => item.id !== id));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View style={styles.inputs}>
        <TextInput
          style={[styles.inputfield, { underlineColorAndroid: firstUnderlineColor }]}
          value={food}
          underlineColorAndroid={firstUnderlineColor}
          onFocus={handleFirstFocus}
          onBlur={handleFirstBlur}
          onChangeText={(value) => setFood(value)}
          placeholder="Product"
          keyboardType="default"
        />
        <TextInput
          style={[styles.inputfield, { underlineColorAndroid: secondUnderlineColor }]}
          value={maara}
          underlineColorAndroid={secondUnderlineColor}
          onFocus={handleSecondFocus}
          onBlur={handleSecondBlur}
          onChangeText={(value) => setMaara(value)}
          placeholder="Quantity"
          keyboardType="default"
        />
      </View>

      <View style={styles.buttons}>
        <Button title="Save" onPress={addItemToDatabase} />
      </View>

      <Text style={styles.text}>Shopping List</Text>

      <FlatList
        data={data}
        renderItem={({ item }) =>
          <View style={styles.item} key={item.id}>
            <Text>{item.product},  {item.quantity}  </Text>
            <TouchableOpacity onPress={() => removeItemFromDatabase(item.id)}>
              <Text style={styles.link}>bought</Text>
            </TouchableOpacity>
          </View>
        }
        keyExtractor={item => item.id.toString()}
      />

      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "white",
    marginTop: "20%",
  },
  inputs: {
    flexDirection: "column",
    alignItems: "center",
    width: "80%",
  },
  inputfield: {
    width: "100%",
    borderWidth: 0.5,
    borderBlockColor: "grey",
    padding: 10,
    marginVertical: 10,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    width: "50%",
  },
  text: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#3458eb",
    paddingTop: 20,
  },
  item: {
    flexDirection: "row",
    textAlign: 'left',
    fontWeight: "bold",
    padding: 2,
    marginVertical: 2,
    width: "100%",

  },
  link: {
    color: "blue",
    textDecorationLine: "none",
  },
});