document.getElementById('rewriteBtn').addEventListener('click', function () {
  const inputText = document.getElementById('inputText').value.trim();
  const rewriteType = document.getElementById('rewriteType').value;
  const outputDiv = document.getElementById('output');

  if (!inputText) {
    outputDiv.innerText = "Please enter text above to rewrite.";
    return;
  }

  // Simulated rewriting (replace with actual API call in future)
  let result;
  switch (rewriteType) {
    case 'casual':
      result = inputText + " 😎 (Rewritten casually)";
      break;
    case 'formal':
      result = "In a more refined tone: " + inputText;
      break;
    case 'friendly':
      result = "Hey there! 😊 " + inputText;
      break;
    case 'storytelling':
      result = "Once upon a time, " + inputText;
      break;
    case 'seo':
      result = inputText + " | Boosted for SEO visibility 🔍";
      break;
    case 'boost':
      result = inputText + " — with enriched context and technical depth!";
      break;
    default:
      result = inputText;
  }

  outputDiv.innerText = result;
});
