import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  TextInput, Modal, ActivityIndicator
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';

export default function ScannerScreen({ navigation, route }) {
  const { mealType } = route.params || { mealType: 'Breakfast' };
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualModal, setManualModal] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestPermission();
  }, []);

  if (!permission) {
    return <View style={s.center}><ActivityIndicator color={COLORS.primary} /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={s.center}>
        <Text style={s.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={s.btn}>
          <Text style={s.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    fetchFoodByBarcode(data);
  };

  const fetchFoodByBarcode = async (code) => {
    setLoading(true);
    try {
      const resp = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const data = await resp.json();
      if (data.status === 1) {
        navigation.navigate('ScanResults', { food: data.product, mealType });
      } else {
        alert('Product not found in database');
        setScanned(false);
      }
    } catch (e) {
      alert('Error fetching product data');
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e", "code128", "code39", "code93", "itf14", "codabar", "aztec", "datamatrix", "pdf417"],
        }}
      >
        <SafeAreaView style={s.overlay}>
          <View style={s.topNav}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.iconBtn}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={s.navTitle}>Scan Barcode</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={s.finder}>
            <View style={s.cornerTopLeft} />
            <View style={s.cornerTopRight} />
            <View style={s.cornerBottomLeft} />
            <View style={s.cornerBottomRight} />
            {loading && <ActivityIndicator size="large" color={COLORS.primary} />}
          </View>

          <View style={s.bottomNav}>
            <TouchableOpacity style={s.manualBtn} onPress={() => setManualModal(true)}>
              <MaterialCommunityIcons name="keyboard-outline" size={24} color="#fff" />
              <Text style={s.manualText}>Enter Manually</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </CameraView>

      <Modal visible={manualModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Enter Barcode</Text>
            <TextInput
              style={s.modalInput}
              placeholder="e.g. 5449000000996"
              keyboardType="numeric"
              value={barcode}
              onChangeText={setBarcode}
              autoFocus
            />
            <View style={s.modalButtons}>
              <TouchableOpacity style={[s.modalBtn, s.cancelBtn]} onPress={() => setManualModal(false)}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[s.modalBtn, s.confirmBtn]} 
                onPress={() => {
                  setManualModal(false);
                  fetchFoodByBarcode(barcode);
                }}
              >
                <Text style={s.confirmBtnText}>Lookup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between' },
  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg },
  navTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#fff' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  
  finder: {
    width: 280, height: 200, alignSelf: 'center',
    justifyContent: 'center', alignItems: 'center', position: 'relative'
  },
  cornerTopLeft: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: COLORS.primary },
  cornerTopRight: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: COLORS.primary },
  cornerBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: COLORS.primary },
  cornerBottomRight: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: COLORS.primary },

  bottomNav: { padding: 40, alignItems: 'center' },
  manualBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: RADIUS.pill },
  manualText: { fontFamily: FONTS.bold, fontSize: 15, color: '#fff', marginLeft: 10 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  permissionText: { fontFamily: FONTS.medium, fontSize: 16, color: COLORS.textDark, textAlign: 'center', marginBottom: 20 },
  btn: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: RADIUS.md },
  btnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#fff' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 24 },
  modalTitle: { fontFamily: FONTS.black, fontSize: 20, color: COLORS.textDark, marginBottom: 16 },
  modalInput: { backgroundColor: '#F3F4F6', borderRadius: RADIUS.md, padding: 16, fontSize: 18, fontFamily: FONTS.medium, marginBottom: 24 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: RADIUS.md, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F3F4F6' },
  cancelBtnText: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textMuted },
  confirmBtn: { backgroundColor: COLORS.primary },
  confirmBtnText: { fontFamily: FONTS.bold, fontSize: 15, color: '#fff' },
});
