  const handleGuess = (word: string, _isTimeout = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = word === correctWord;

    if (isCorrect) {
      hapticSuccess();
    } else {
      hapticError();
    }

    // تمرير نتيجة تخمين الجاسوس — هذه قيمة منطقية واحدة فقط
    // (true لو خمّن صح، false لو خطأ أو انتهى الوقت)
    navigation.navigate('Vote', {
      players,
      spies,
      secretWord: correctWord,
      categoryName,
      categoryId,
      spyGuessedCorrectly: isCorrect,
    });
  };