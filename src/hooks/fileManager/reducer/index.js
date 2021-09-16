export const SET_FILES = 'SET_FILES'
export const CLEAN = 'CLEAN'

export const initialState = {
  files: [],
  type: 'quick',
}

export const reducer = (prevState, { type, payload }) => {
  switch (type) {
    case SET_FILES:
      return {
        ...prevState,
        files: payload?.files ?? [],
        type: payload?.type ?? 'quick',
      }

    case CLEAN:
      return {
        ...initialState,
      }

    default:
      return prevState
  }
}
