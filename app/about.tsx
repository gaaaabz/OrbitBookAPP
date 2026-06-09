import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#60A5FA" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sobre Nós</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="rocket-outline" size={64} color="#60A5FA" />
          </View>
          <Text style={styles.heroTitle}>OrbitBook</Text>
          <Text style={styles.heroSubtitle}>
            Sua porta de entrada para o turismo espacial
          </Text>
        </View>

        {/* Missão */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="target-outline" size={24} color="#60A5FA" />
            <Text style={styles.sectionTitle}>Nossa Missão</Text>
          </View>
          <Text style={styles.sectionText}>
            Democratizar o acesso ao turismo espacial, tornando possível para
            qualquer pessoa vivenciar a emoção de viajar para o espaço. Nós
            conectamos sonhadores com as melhores experiências espaciais
            disponíveis no mercado.
          </Text>
        </View>

        {/* Visão */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye-outline" size={24} color="#60A5FA" />
            <Text style={styles.sectionTitle}>Nossa Visão</Text>
          </View>
          <Text style={styles.sectionText}>
            Ser a plataforma global número um para reservas de viagens
            espaciais, onde milhões de pessoas possam explorar destinos além da
            atmosfera com segurança, conforto e acessibilidade.
          </Text>
        </View>

        {/* Por Que Escolher */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={24} color="#60A5FA" />
            <Text style={styles.sectionTitle}>Por Que Escolher OrbitBook?</Text>
          </View>

          <View style={styles.featureList}>
            <FeatureItem
              icon="shield-checkmark-outline"
              title="Segurança Garantida"
              description="Parceiros oficiais com certificação FAA e padrões internacionais."
            />
            <FeatureItem
              icon="sparkles-outline"
              title="Experiências Únicas"
              description="De voos suborbitais até expedições para Marte e além."
            />
            <FeatureItem
              icon="people-outline"
              title="Comunidade Global"
              description="Conecte-se com milhares de viajantes espaciais."
            />
            <FeatureItem
              icon="chatbubble-ellipses-outline"
              title="Assistente IA 24/7"
              description="Suporte inteligente para ajudar em todas as suas dúvidas."
            />
            <FeatureItem
              icon="pricetag-outline"
              title="Melhores Preços"
              description="Ofertas exclusivas e comparação de operadores certificados."
            />
            <FeatureItem
              icon="checkmark-circle-outline"
              title="Processo Simples"
              description="Reservas rápidas com documentação guiada e suporte pré-voo."
            />
          </View>
        </View>

        {/* Números */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>2.847+</Text>
            <Text style={styles.statLabel}>Viajantes Espaciais</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>15</Text>
            <Text style={styles.statLabel}>Destinos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>99.8%</Text>
            <Text style={styles.statLabel}>Segurança</Text>
          </View>
        </View>

        {/* Como Funciona */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="play-circle-outline" size={24} color="#60A5FA" />
            <Text style={styles.sectionTitle}>Como Funciona</Text>
          </View>

          <View style={styles.stepsContainer}>
            <StepItem
              number="1"
              title="Explore"
              description="Navegue por nosso catálogo de 15+ destinos espaciais."
            />
            <StepItem
              number="2"
              title="Consulte"
              description="Converse com nosso assistente IA para encontrar o ideal."
            />
            <StepItem
              number="3"
              title="Reserve"
              description="Faça sua reserva de forma simples e segura."
            />
            <StepItem
              number="4"
              title="Prepare-se"
              description="Receba guias de treinamento e prepare-se para o grande dia."
            />
            <StepItem
              number="5"
              title="Decolue!"
              description="Viva a experiência transformadora de sua vida."
            />
          </View>
        </View>

        {/* Tecnologia */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="hardware-chip-outline" size={24} color="#60A5FA" />
            <Text style={styles.sectionTitle}>Powered by Technology</Text>
          </View>
          <Text style={styles.sectionText}>
            Utilizamos Inteligência Artificial de ponta para personalizar
            recomendações, garantir segurança máxima com sistemas de criptografia
            e oferecer suporte instantâneo 24/7 para nossos usuários.
          </Text>
        </View>

        {/* Contato */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail-outline" size={24} color="#60A5FA" />
            <Text style={styles.sectionTitle}>Fale Conosco</Text>
          </View>
          <Text style={styles.sectionText}>
            Tem dúvidas? Nossa equipe está pronta para ajudar!
          </Text>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="call-outline" size={18} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Entre em Contato</Text>
          </TouchableOpacity>
        </View>

        {/* Botão CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push("/destinations")}
        >
          <Text style={styles.ctaButtonText}>Comece Sua Aventura</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={20} color="#60A5FA" />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

function StepItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1020",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  container: {
    flex: 1,
    backgroundColor: "#0B1020",
  },

  heroSection: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(96, 165, 250, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  heroTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },

  heroSubtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },

  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  sectionText: {
    fontSize: 14,
    color: "#D1D5DB",
    lineHeight: 22,
  },

  featureList: {
    gap: 16,
  },

  featureItem: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
  },

  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(96, 165, 250, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  featureContent: {
    flex: 1,
  },

  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  featureDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 18,
  },

  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },

  statCard: {
    backgroundColor: "#111827",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
    marginBottom: 12,
    alignItems: "center",
  },

  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#60A5FA",
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 14,
    color: "#9CA3AF",
  },

  stepsContainer: {
    gap: 12,
  },

  stepItem: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
  },

  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  stepNumberText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  stepContent: {
    flex: 1,
    justifyContent: "center",
  },

  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },

  stepDescription: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  contactButton: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },

  contactButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  ctaButton: {
    marginHorizontal: 20,
    marginVertical: 24,
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  ctaButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },

  footer: {
    height: 20,
  },
});
