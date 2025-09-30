export const frameworkData = [
  {
    value: 'wbs',
    label: 'WBS (Work Breakdown Structure)',
    description:
      'A project management classic. Break down large projects into smaller, manageable parts. Ideal for construction and traditional projects.',
    image: '/storage/assets/images/wbs.svg',
    learnMore: 'https://en.wikipedia.org/wiki/Work_breakdown_structure',
  },
  {
    value: 'scrum',
    label: 'Scrum (Agile Project Board)',
    description:
      'An agile framework for developing and delivering complex products. Organizes work into sprints with a focus on iterative progress.',
    image: '/storage/assets/images/scrum.svg',
    learnMore: 'https://www.scrum.org/resources/what-is-scrum',
  },
  {
    value: 'status',
    label: 'Status-Based (Simple Kanban)',
    description:
      "A simple and visual workflow. Move tasks through columns like 'To Do', 'In Progress', and 'Done'. Great for simple task tracking.",
    image: '/storage/assets/images/status.svg',
    learnMore: 'https://en.wikipedia.org/wiki/Kanban_board',
  },
];

export const getFrameworkDropdownData = () => {
  return [
    { value: '', label: 'Do not generate task groups' },
    ...frameworkData.map(f => ({ value: f.value, label: f.label })),
  ];
};

export const findFrameworkByValue = value => {
  return frameworkData.find(f => f.value === value);
};
