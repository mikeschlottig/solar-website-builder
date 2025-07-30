# Mock database for local development when PostgreSQL is not available
import os
from typing import Dict, Any, List, Optional

class MockTable:
    """Mock table for development without PostgreSQL"""
    
    def __init__(self, table_name: str):
        self.table_name = table_name
        self._data = {}
        self._id_counter = 1
    
    def insert(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Mock insert operation"""
        data['id'] = self._id_counter
        self._data[self._id_counter] = data
        self._id_counter += 1
        return data
    
    def select(self, where: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Mock select operation"""
        results = list(self._data.values())
        if where:
            # Simple filtering
            filtered = []
            for item in results:
                match = True
                for key, value in where.items():
                    if item.get(key) != value:
                        match = False
                        break
                if match:
                    filtered.append(item)
            return filtered
        return results
    
    def update(self, data: Dict[str, Any], where: Dict[str, Any]) -> int:
        """Mock update operation"""
        updated_count = 0
        for item_id, item in self._data.items():
            match = True
            for key, value in where.items():
                if item.get(key) != value:
                    match = False
                    break
            if match:
                item.update(data)
                updated_count += 1
        return updated_count
    
    def delete(self, where: Dict[str, Any]) -> int:
        """Mock delete operation"""
        to_delete = []
        for item_id, item in self._data.items():
            match = True
            for key, value in where.items():
                if item.get(key) != value:
                    match = False
                    break
            if match:
                to_delete.append(item_id)
        
        for item_id in to_delete:
            del self._data[item_id]
        
        return len(to_delete)

# Mock database connection
class MockDatabase:
    def __init__(self):
        self.tables = {}
    
    def get_table(self, table_name: str) -> MockTable:
        if table_name not in self.tables:
            self.tables[table_name] = MockTable(table_name)
        return self.tables[table_name]

# Global mock database instance
mock_db = MockDatabase()

def use_mock_db():
    """Check if we should use mock database"""
    return os.getenv("ENV") == "development" and not os.getenv("DATABASE_URL", "").startswith("postgresql://")