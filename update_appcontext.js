const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// 1. Add methods to AppContextType
code = code.replace('  locations: string[];', `  locations: string[];\n  addLocation: (address: string) => Promise<void>;\n  updateLocation: (oldAddress: string, newAddress: string) => Promise<void>;\n  deleteLocation: (address: string) => Promise<void>;`);

// 2. Add state
code = code.replace('  const [approvalConfig, setApprovalConfig] = useState<ApprovalConfig>(INITIAL_APPROVAL_CONFIG);', `  const [approvalConfig, setApprovalConfig] = useState<ApprovalConfig>(INITIAL_APPROVAL_CONFIG);\n  const [locations, setLocations] = useState<string[]>(INITIAL_LOCATIONS);`);

// 3. Add onSnapshot
code = code.replace('    const unsubConfig = onSnapshot(doc(db, "settings", "approvalConfig"), (docSnap) => {\n      if (docSnap.exists()) setApprovalConfig(docSnap.data() as ApprovalConfig);\n    });', `    const unsubConfig = onSnapshot(doc(db, "settings", "approvalConfig"), (docSnap) => {\n      if (docSnap.exists()) setApprovalConfig(docSnap.data() as ApprovalConfig);\n    });\n    const unsubLocations = onSnapshot(doc(db, "settings", "locations"), (docSnap) => {\n      if (docSnap.exists() && docSnap.data().addresses) {\n        setLocations(docSnap.data().addresses);\n      }\n    });`);

// 4. Cleanup unsubLocations
code = code.replace('      unsubNotifs(); unsubConfig();\n    };\n  }, []);', `      unsubNotifs(); unsubConfig(); unsubLocations();\n    };\n  }, []);`);

// 5. Add functions
const functionsToAdd = `
  const addLocation = async (address: string) => {
    if (!['admin', 'manager', 'director'].includes(role)) return;
    const newLocations = [...locations, address];
    await setDoc(doc(db, "settings", "locations"), { addresses: newLocations }, { merge: true });
    await addAudit('Added Location', 'settings', { details: address });
  };
  
  const updateLocation = async (oldAddress: string, newAddress: string) => {
    if (!['admin', 'manager', 'director'].includes(role)) return;
    const newLocations = locations.map(l => l === oldAddress ? newAddress : l);
    await setDoc(doc(db, "settings", "locations"), { addresses: newLocations }, { merge: true });
    await addAudit('Updated Location', 'settings', { details: \`\${oldAddress} -> \${newAddress}\` });
  };

  const deleteLocation = async (address: string) => {
    if (!['admin', 'manager', 'director'].includes(role)) return;
    const newLocations = locations.filter(l => l !== address);
    await setDoc(doc(db, "settings", "locations"), { addresses: newLocations }, { merge: true });
    await addAudit('Deleted Location', 'settings', { details: address });
  };
`;
code = code.replace('  // --- 1. CORE CRUD & ACTIONS ---', `  // --- 1. CORE CRUD & ACTIONS ---\n${functionsToAdd}`);

// 6. Return locations in provider (remove the old locations: INITIAL_LOCATIONS and pass state and functions)
code = code.replace('        locations: INITIAL_LOCATIONS,', `        locations,\n        addLocation,\n        updateLocation,\n        deleteLocation,`);

fs.writeFileSync('src/context/AppContext.tsx', code);
