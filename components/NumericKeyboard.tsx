import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface NumericKeyboardProps {
  value: string;
  onValueChange: (value: string) => void;
  onDone: () => void;
  allowDecimal?: boolean;
}

export default function NumericKeyboard({ 
  value, 
  onValueChange, 
  onDone,
  allowDecimal = false 
}: NumericKeyboardProps) {
  
  const handlePress = (key: string) => {
    if (key === 'backspace') {
      onValueChange(value.slice(0, -1));
    } else if (key === '.') {
      if (allowDecimal && !value.includes('.')) {
        onValueChange(value + key);
      }
    } else {
      onValueChange(value + key);
    }
  };

  const renderKey = (number: string, letters?: string) => (
    <TouchableOpacity
      key={number}
      style={styles.key}
      onPress={() => handlePress(number)}
    >
      <Text style={styles.keyNumber}>{number}</Text>
      {letters && <Text style={styles.keyLetters}>{letters}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={onDone}
        >
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.keyboard}>
        <View style={styles.row}>
          {renderKey('1')}
          {renderKey('2', 'ABC')}
          {renderKey('3', 'DEF')}
        </View>
        
        <View style={styles.row}>
          {renderKey('4', 'GHI')}
          {renderKey('5', 'JKL')}
          {renderKey('6', 'MNO')}
        </View>
        
        <View style={styles.row}>
          {renderKey('7', 'PQRS')}
          {renderKey('8', 'TUV')}
          {renderKey('9', 'WXYZ')}
        </View>
        
        <View style={styles.row}>
          {allowDecimal ? (
            <TouchableOpacity
              style={styles.key}
              onPress={() => handlePress('.')}
            >
              <Text style={styles.keyNumber}>.</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.key} />
          )}
          
          {renderKey('0')}
          
          <TouchableOpacity
            style={styles.key}
            onPress={() => handlePress('backspace')}
          >
            <Text style={styles.backspaceIcon}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#D3D6DB',
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#D3D6DB',
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  doneText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  keyboard: {
    paddingHorizontal: 6,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 12,
  },
  key: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    width: 110,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  keyNumber: {
    fontSize: 28,
    fontWeight: '400',
    color: COLORS.black,
  },
  keyLetters: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: -4,
    letterSpacing: 2,
  },
  backspaceIcon: {
    fontSize: 28,
    color: COLORS.black,
  },
});
