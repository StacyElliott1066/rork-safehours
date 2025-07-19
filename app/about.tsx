import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Clock, Shield, AlertTriangle, BarChart2, Database } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

export default function AboutScreen() {
  const router = useRouter();
  
  const goBack = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'About SafeHours',
          headerLeft: () => (
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>SafeHours</Text>
            <Text style={styles.headerSubtitle}>Flight Instructor Duty Time Tracker</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About This App</Text>
            <Text style={styles.paragraph}>
              SafeHours is designed specifically for flight instructors to track and manage their duty time, 
              ensuring compliance with regulatory requirements and promoting safety through proper rest and 
              duty time management.
            </Text>
          </View>
          
          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>⚠️ Important Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              The maker of this app is not responsible for any violations of FAA or Company regulations. 
              This data is for informational purposes only. Users are solely responsible for ensuring 
              the accuracy of all times entered and for compliance with all applicable regulations. 
              Always verify your duty time calculations and consult official sources for regulatory requirements.
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Clock size={24} color={COLORS.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Activity Tracking</Text>
                <Text style={styles.featureDescription}>
                  Log flight instruction, ground instruction, simulator sessions, and other activities with 
                  precise timing and pre/post duty calculations.
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Shield size={24} color={COLORS.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Rolling 24-Hour Monitor</Text>
                <Text style={styles.featureDescription}>
                  Visual representation of your flight instruction hours and contact time in a rolling 24-hour period, 
                  helping you stay under regulatory limits and maintain compliance.
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <AlertTriangle size={24} color={COLORS.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Compliance Warnings</Text>
                <Text style={styles.featureDescription}>
                  Automatic alerts when approaching or exceeding duty time limits, rest requirements, 
                  or consecutive work day restrictions.
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <BarChart2 size={24} color={COLORS.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Statistics & Analysis</Text>
                <Text style={styles.featureDescription}>
                  Weekly and monthly breakdowns of your duty time, helping you identify patterns and 
                  optimize your schedule.
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Database size={24} color={COLORS.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Data Management</Text>
                <Text style={styles.featureDescription}>
                  Import and export your duty time records for record-keeping, reporting, or backup purposes.
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Compliance Tracking</Text>
            <Text style={styles.paragraph}>
              SafeHours helps you monitor and maintain compliance with:
            </Text>
            <View style={styles.complianceList}>
              <Text style={styles.complianceItem}>• Maximum flight instruction hours in 24 hours</Text>
              <Text style={styles.complianceItem}>• Maximum contact time in 24 hours</Text>
              <Text style={styles.complianceItem}>• Minimum rest between duty days</Text>
              <Text style={styles.complianceItem}>• Maximum duty day length</Text>
              <Text style={styles.complianceItem}>• Maximum consecutive work days</Text>
              <Text style={styles.complianceItem}>• Weekly and rolling 7-day hour limits</Text>
            </View>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Privacy & Data</Text>
            <Text style={styles.paragraph}>
              All your data is stored locally on your device. SafeHours does not collect, transmit, 
              or share your personal information or duty records with any third parties.
            </Text>
          </View>
          
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version 25.7.19.09</Text>
            <Text style={styles.copyrightText}>© 2025 SafeHours. All rights reserved.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disclaimerCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFEAA7',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#856404',
  },
  disclaimerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#856404',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: COLORS.black,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.darkGray,
  },
  complianceList: {
    marginTop: 8,
  },
  complianceItem: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.darkGray,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: COLORS.gray,
  },
});