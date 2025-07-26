// In your Records View
import FileManager from './components/FileManager';

<FileManager 
  recordId={record.id}
  onFileDeleted={(fileName) => console.log('Deleted:', fileName)}
/>