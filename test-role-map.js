const agents = [
  { name: 'atlantis-builder', model: 'ollama/qwen3-next-coder:cloud', role: 'Builder', status: 'active' },
  { name: 'gemini-3-pro', model: 'google/gemini-3.1-pro-preview', role: 'Reviewer', status: 'monitoring' }
];

function roleOwnerMap(agents = []) {
  const mappings = [
    ['Builder', 'Builder'],
    ['Reviewer', 'Reviewer'],
    ['Auditor', 'Auditor'],
    ['Supervisor', 'Supervisor']
  ];

  return mappings.reduce((acc, [projectRole, agentRole]) => {
    const agent = (agents || []).find((item) => (item.roles || []).includes(agentRole));
    if (agent) {
      acc[projectRole] = {
        name: agent.name,
        model: agent.model,
        label: `${agent.name} / ${agent.model}`,
        status: agent.status
      };
    }
    return acc;
  }, {});
}

const map = roleOwnerMap(agents);
console.log('Map output:', map);