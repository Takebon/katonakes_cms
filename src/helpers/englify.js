export const englify = string => {
  const length = string.length //?
  let newString = ''
  for(let i = 0; i < length; i++){
    let letter = string.charAt(i) //?
    switch(letter){
      case "á":
        newString += 'a'
        break
      case "é":
        newString += 'e'
        break
      case "í":
        newString += 'i'
        break
      case "ü":
        newString += 'u'
        break      
      case "ű":
        newString += 'u'
        break      
      case "ö":
        newString += 'o'
        break      
      case "ő":
        newString += 'o'
        break      
      case "ó":
        newString += 'o'
        break      
      case "ú":
        newString += 'u'
        break      
      default:
        newString += letter
    }  
  }
  return newString 
}