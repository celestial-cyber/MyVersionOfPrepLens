const RAW_QUESTION_BANK = [
  { id: 1, category: 'Aptitude', difficulty: 'Hard', question: 'A train running at 72 km/h crosses a platform in 25 seconds and a pole in 15 seconds. Find platform length.', options: ['200 m', '240 m', '300 m', '150 m'], answer: '200 m' },
  { id: 2, category: 'Aptitude', difficulty: 'Hard', question: 'A can do work in 10 days, B in 15 days. They work together 3 days, then A leaves. How many more days for B?', options: ['5', '6', '7', '4'], answer: '5' },
  { id: 3, category: 'Aptitude', difficulty: 'Hard', question: 'Compound interest on Rs5000 at 10% for 2 years?', options: ['Rs1050', 'Rs1100', 'Rs1025', 'Rs1000'], answer: 'Rs1050' },
  { id: 4, category: 'Aptitude', difficulty: 'Hard', question: 'Find next number: 2, 6, 12, 20, 30, ?', options: ['36', '40', '42', '44'], answer: '42' },
  { id: 5, category: 'Aptitude', difficulty: 'Hard', question: 'If 8 men build wall in 12 days, how many men needed in 6 days?', options: ['12', '16', '18', '20'], answer: '16' },
  { id: 6, category: 'Aptitude', difficulty: 'Hard', question: 'Find average of first 20 natural numbers.', options: ['10', '10.5', '11', '9.5'], answer: '10.5' },
  { id: 7, category: 'Aptitude', difficulty: 'Hard', question: 'If selling price is 20% more than cost, profit percent?', options: ['20%', '16.67%', '25%', '18%'], answer: '20%' },
  { id: 8, category: 'Aptitude', difficulty: 'Hard', question: 'A mixture of 40L milk-water ratio 3:2. How much water added to make 1:1?', options: ['8L', '10L', '12L', '15L'], answer: '10L' },
  { id: 9, category: 'Aptitude', difficulty: 'Hard', question: 'Find LCM of 24 and 36.', options: ['48', '72', '96', '108'], answer: '72' },
  { id: 10, category: 'Aptitude', difficulty: 'Hard', question: 'A sum doubles in 5 years simple interest. Rate?', options: ['20%', '10%', '15%', '25%'], answer: '20%' },
  { id: 11, category: 'Aptitude', difficulty: 'Hard', question: 'Probability of getting exactly 2 heads in 3 coin tosses?', options: ['3/8', '1/2', '1/4', '5/8'], answer: '3/8' },
  { id: 12, category: 'Aptitude', difficulty: 'Hard', question: 'Find missing number: 5, 11, 23, 47, ?', options: ['95', '96', '97', '94'], answer: '95' },
  { id: 13, category: 'Aptitude', difficulty: 'Hard', question: 'A can finish job in 20 days, B in 30 days. Working alternately starting A, days needed?', options: ['24', '25', '26', '27'], answer: '24' },
  { id: 14, category: 'Aptitude', difficulty: 'Hard', question: 'Find remainder of 7^100 divided by 6.', options: ['1', '5', '0', '2'], answer: '1' },
  { id: 15, category: 'Aptitude', difficulty: 'Hard', question: 'Find next: 3, 9, 27, 81, ?', options: ['162', '243', '324', '729'], answer: '243' },

  { id: 16, category: 'Technical', difficulty: 'Hard', question: 'Time complexity of merge sort?', options: ['O(n log n)', 'O(n^2)', 'O(log n)', 'O(n)'], answer: 'O(n log n)' },
  { id: 17, category: 'Technical', difficulty: 'Hard', question: 'Which data structure uses LIFO?', options: ['Queue', 'Stack', 'Tree', 'Graph'], answer: 'Stack' },
  { id: 18, category: 'Technical', difficulty: 'Hard', question: 'Worst case quicksort complexity?', options: ['O(n log n)', 'O(n^2)', 'O(n)', 'O(log n)'], answer: 'O(n^2)' },
  { id: 19, category: 'Technical', difficulty: 'Hard', question: 'Binary search works only on?', options: ['Sorted array', 'Linked list', 'Graph', 'Stack'], answer: 'Sorted array' },
  { id: 20, category: 'Technical', difficulty: 'Hard', question: 'Which is not OOP principle?', options: ['Encapsulation', 'Polymorphism', 'Compilation', 'Inheritance'], answer: 'Compilation' },
  { id: 21, category: 'Technical', difficulty: 'Hard', question: 'Which traversal gives sorted BST?', options: ['Preorder', 'Inorder', 'Postorder', 'Level'], answer: 'Inorder' },
  { id: 22, category: 'Technical', difficulty: 'Hard', question: 'Deadlock requires?', options: ['Mutual exclusion', 'Hold and wait', 'Circular wait', 'All'], answer: 'All' },
  { id: 23, category: 'Technical', difficulty: 'Hard', question: 'Normalization reduces?', options: ['Redundancy', 'Speed', 'Security', 'Indexes'], answer: 'Redundancy' },
  { id: 24, category: 'Technical', difficulty: 'Hard', question: 'Hash collision handled by?', options: ['Chaining', 'Open addressing', 'Both', 'None'], answer: 'Both' },
  { id: 25, category: 'Technical', difficulty: 'Hard', question: 'TCP is?', options: ['Connectionless', 'Connection oriented', 'Stateless', 'None'], answer: 'Connection oriented' },
  { id: 26, category: 'Technical', difficulty: 'Hard', question: 'Which memory is fastest?', options: ['RAM', 'Cache', 'Hard disk', 'ROM'], answer: 'Cache' },
  { id: 27, category: 'Technical', difficulty: 'Hard', question: 'Which sorting is stable?', options: ['Merge', 'Quick', 'Heap', 'Selection'], answer: 'Merge' },
  { id: 28, category: 'Technical', difficulty: 'Hard', question: 'DFS uses?', options: ['Queue', 'Stack', 'Heap', 'Tree'], answer: 'Stack' },
  { id: 29, category: 'Technical', difficulty: 'Hard', question: 'SQL JOIN combines?', options: ['Tables', 'Columns', 'Rows', 'Indexes'], answer: 'Tables' },
  { id: 30, category: 'Technical', difficulty: 'Hard', question: 'Primary key can be?', options: ['Null', 'Unique & Not Null', 'Duplicate', 'None'], answer: 'Unique & Not Null' },

  { id: 31, category: 'Reasoning', difficulty: 'Hard', question: 'Find odd one: Apple, Banana, Carrot, Mango', options: ['Apple', 'Banana', 'Carrot', 'Mango'], answer: 'Carrot' },
  { id: 32, category: 'Reasoning', difficulty: 'Hard', question: 'Coding: CAT -> DBU. DOG -> ?', options: ['EPH', 'EOG', 'DPH', 'EOH'], answer: 'EPH' },
  { id: 33, category: 'Reasoning', difficulty: 'Hard', question: 'Find missing: A, C, F, J, O, ?', options: ['U', 'T', 'V', 'W'], answer: 'U' },
  { id: 34, category: 'Reasoning', difficulty: 'Hard', question: 'Clock shows 3:15. Angle?', options: ['7.5 deg', '0 deg', '15 deg', '30 deg'], answer: '7.5 deg' },
  { id: 35, category: 'Reasoning', difficulty: 'Hard', question: 'Series: 1, 1, 2, 3, 5, 8, ?', options: ['11', '13', '12', '10'], answer: '13' },
  { id: 36, category: 'Reasoning', difficulty: 'Hard', question: 'Which comes next: Z, X, U, Q, ?', options: ['L', 'K', 'M', 'N'], answer: 'L' },
  { id: 37, category: 'Reasoning', difficulty: 'Hard', question: 'Mirror image of 2:45?', options: ['9:15', '9:45', '10:15', '8:15'], answer: '9:15' },
  { id: 38, category: 'Reasoning', difficulty: 'Hard', question: 'Find odd: 2, 3, 5, 7, 9', options: ['2', '3', '5', '9'], answer: '9' },
  { id: 39, category: 'Reasoning', difficulty: 'Hard', question: 'If A>B>C>D, who smallest?', options: ['A', 'B', 'C', 'D'], answer: 'D' },
  { id: 40, category: 'Reasoning', difficulty: 'Hard', question: 'Find next: 4, 6, 9, 13, 18, ?', options: ['22', '24', '23', '25'], answer: '24' },

  { id: 41, category: 'Verbal', difficulty: 'Hard', question: "Synonym of 'Meticulous'", options: ['Careless', 'Precise', 'Lazy', 'Quick'], answer: 'Precise' },
  { id: 42, category: 'Verbal', difficulty: 'Hard', question: "Antonym of 'Benevolent'", options: ['Kind', 'Generous', 'Cruel', 'Happy'], answer: 'Cruel' },
  { id: 43, category: 'Verbal', difficulty: 'Hard', question: 'Correct sentence?', options: ['She do her work', 'She does her work', 'She done her work', 'She doing her work'], answer: 'She does her work' },
  { id: 44, category: 'Verbal', difficulty: 'Hard', question: 'Fill blank: He insisted ___ paying bill.', options: ['on', 'at', 'to', 'for'], answer: 'on' },
  { id: 45, category: 'Verbal', difficulty: 'Hard', question: "Meaning of 'Euphoria'", options: ['Sadness', 'Excitement', 'Fear', 'Anger'], answer: 'Excitement' },
  { id: 46, category: 'Verbal', difficulty: 'Hard', question: 'Choose correct spelling', options: ['Accomodate', 'Accommodate', 'Acommodate', 'Acomodate'], answer: 'Accommodate' },
  { id: 47, category: 'Verbal', difficulty: 'Hard', question: 'Passive voice: She wrote letter', options: ['Letter was written by her', 'Letter written her', 'Letter writes her', 'Letter is write'], answer: 'Letter was written by her' },
  { id: 48, category: 'Verbal', difficulty: 'Hard', question: 'Idiom: Break the ice', options: ['Start conversation', 'Fight', 'Stop talking', 'Get angry'], answer: 'Start conversation' },
  { id: 49, category: 'Verbal', difficulty: 'Hard', question: 'Choose correct preposition: Afraid ___ dark', options: ['of', 'at', 'in', 'to'], answer: 'of' },
  { id: 50, category: 'Verbal', difficulty: 'Hard', question: "Meaning of 'Procrastinate'", options: ['Delay work', 'Finish fast', 'Celebrate', 'Organize'], answer: 'Delay work' },
];

function normalizeCategory(category) {
  return String(category || '').trim().toLowerCase();
}

export const QUESTION_BANK = RAW_QUESTION_BANK.map((item) => {
  const correctAnswer = item.options.findIndex((option) => option === item.answer);
  return {
    questionId: `QB-${String(item.id).padStart(3, '0')}`,
    id: item.id,
    category: normalizeCategory(item.category),
    difficulty: String(item.difficulty || 'Hard').toLowerCase(),
    question: item.question,
    options: item.options,
    answer: item.answer,
    correctAnswer: correctAnswer >= 0 ? correctAnswer : 0,
  };
});

export const QUESTION_CATEGORIES = ['aptitude', 'technical', 'reasoning', 'verbal'];

export const QUESTION_COUNTS = {
  aptitude: 15,
  technical: 15,
  reasoning: 10,
  verbal: 10,
};
