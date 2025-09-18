// Script pour exécuter la migration depuis l'interface
import { runMigration } from '../lib/migrationScript';
import { runStorageTests } from '../lib/storageTest';

// Fonction à exécuter depuis la console du navigateur
export async function migrateTolocalStorage() {
  console.log('🚀 Démarrage de la migration vers le stockage local...');
  
  try {
    // Exécuter la migration
    await runMigration();
    
    // Tester le nouveau système
    console.log('\n🧪 Test du nouveau système...');
    await runStorageTests();
    
    console.log('\n✅ Migration terminée avec succès!');
    console.log('📁 Tes données sont maintenant sauvegardées dans le dossier data/');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

// Pour l'utiliser depuis la console du navigateur:
// migrateTolocalStorage()