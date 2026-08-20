export const autoCategorizeMerchant = (description) => {
  const keywords = {
    'Food & Dining': [
      'restaurant', 'cafe', 'lunch', 'dinner', 'breakfast', 'food', 'pizza', 
      'burger', 'starbucks', 'mcdonald', 'subway', 'domino', 'kfc', 'taco',
      'coffee', 'bar', 'pub', 'bakery', 'grocery', 'supermarket'
    ],
    'Transportation': [
      'uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'bus', 'train',
      'metro', 'subway', 'flight', 'airline', 'car', 'vehicle', 'toll'
    ],
    'Shopping': [
      'amazon', 'mall', 'store', 'clothes', 'shoes', 'electronics', 'target',
      'walmart', 'clothing', 'fashion', 'retail', 'shop', 'purchase'
    ],
    'Entertainment': [
      'movie', 'cinema', 'netflix', 'spotify', 'concert', 'game', 'theater',
      'streaming', 'subscription', 'music', 'video', 'hulu', 'disney'
    ],
    'Bills & Utilities': [
      'electric', 'water', 'internet', 'phone', 'rent', 'insurance', 'utility',
      'bill', 'payment', 'mortgage', 'loan', 'credit card'
    ],
    'Healthcare': [
      'doctor', 'hospital', 'pharmacy', 'medicine', 'dental', 'medical',
      'health', 'clinic', 'prescription', 'cvs', 'walgreens'
    ],
    'Education': [
      'book', 'course', 'tuition', 'school', 'university', 'college',
      'education', 'learning', 'training', 'class', 'seminar'
    ]
  };
  
  const lowerDesc = description.toLowerCase();
  
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => lowerDesc.includes(word))) {
      return category;
    }
  }
  
  return 'Others';
};

export const detectRecurringPattern = (expenses) => {
  // Simple recurring detection based on similar amounts and descriptions
  const patterns = {};
  
  expenses.forEach(exp => {
    const key = `${exp.description.toLowerCase()}-${Math.round(exp.amount)}`;
    if (!patterns[key]) {
      patterns[key] = [];
    }
    patterns[key].push(exp.date);
  });
  
  const recurring = [];
  Object.entries(patterns).forEach(([key, dates]) => {
    if (dates.length >= 2) {
      recurring.push({
        description: key.split('-')[0],
        count: dates.length,
        dates
      });
    }
  });
  
  return recurring;
};

export const predictNextMonthSpending = (expenses) => {
  if (expenses.length < 5) {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return total * 1.05; // 5% increase estimate
  }
  
  // Calculate average of last 3 months
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const recentExpenses = expenses.filter(exp => 
    new Date(exp.date) >= threeMonthsAgo
  );
  
  const total = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const avgPerMonth = total / 3;
  
  // Add 10% buffer for prediction
  return avgPerMonth * 1.1;
};