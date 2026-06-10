export const VoteScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VoteRouteProp>();
  const { players, spies, secretWord, categoryId, categoryName } = route.params;
  // القيمة الافتراضية false (لم يخمّن الجاسوس أو تخطّى مرحلة التخمين)
  const spyGuessedCorrectly = route.params.spyGuessedCorrectly ?? false;

  // اعتراض زر الرجوع — لا مغادرة أثناء التصويت بدون تأكيد
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'مغادرة التصويت',
          'هل تريد إلغاء جولة التصويت والعودة للقائمة الرئيسية؟',
          [
            { text: 'تراجع', style: 'cancel' },
            {
              text: 'خروج',
              style: 'destructive',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigation])
  );

  // All players vote (including spies can vote to confuse)
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [skippedVoters, setSkippedVoters] = useState<Set<string>>(new Set());

  const currentVoter = players[currentVoterIndex];
  const isLastVoter = currentVoterIndex === players.length - 1;
  const hasVoted = votes[currentVoter] !== undefined || skippedVoters.has(currentVoter);

  const handleVote = (suspectedSpy: string) => {
    hapticLight();
    setVotes({ ...votes, [currentVoter]: suspectedSpy });
    setSkippedVoters(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentVoter);
      return newSet;
    });
  };

  const handleSkip = () => {
    hapticLight();
    const newSkipped = new Set(skippedVoters);
    newSkipped.add(currentVoter);
    setSkippedVoters(newSkipped);
    // Remove any previous vote if exists
    const newVotes = { ...votes };
    delete newVotes[currentVoter];
    setVotes(newVotes);
  };

  const handleNext = () => {
    if (!hasVoted) return;

    hapticSuccess();

    if (isLastVoter) {
      // الجواسيس يُستبعدون من correctVoters حتى لو صوّتوا على جاسوس آخر
      const correctVoters: string[] = [];
      Object.entries(votes).forEach(([voter, suspected]) => {
        if (spies.includes(suspected) && !spies.includes(voter)) {
          correctVoters.push(voter);
        }
      });

      // تمرير spyGuessedCorrectly الذي استلمناه من SpyGuessScreen
      // (أو false كقيمة افتراضية إن لم يدخل الجاسوس مرحلة التخمين)
      navigation.navigate('Results', {
        players,
        spies,
        secretWord,
        categoryName: categoryName || '',
        categoryId,
        correctVoters,
        spyGuessedCorrectly,
      });
    } else {
      setCurrentVoterIndex(currentVoterIndex + 1);
    }
  };