import { createSlice } from '@reduxjs/toolkit';

//定義slice 當中包含 reducer&action 
//原本 reducer=執行邏輯  action=行為描述 reducer根據action type選擇邏輯執行
//slice將其合一 reducer直接作為action type
export const counterSlice = createSlice({
    name: 'counter',
    initialState: {
        value: 0,
    },
    reducers: {
        increment: state => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the Immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            state.value += 1;
        },
        decrement: state => {
            state.value -= 1;
        },
        incrementByAmount: (state, action) => {
            state.value += action.payload;
        },
        test: (state, action) => {
            console.log('test state=' + state + ' action.payload=' + action.payload);
            console.log(state.value);
        },
    },
});

//從上面的slice取action作export (下方會用到這些action)
export const { increment, decrement, incrementByAmount, test } = counterSlice.actions;


//export一個帶參數的方法 並使用toolkit的dispatch執行action,
//雖然沒有定義在slice.action中,但可用此方式來執行action並加上一些操作
// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const incrementAsync = (amount) =>
    dispatch => {

        setTimeout(() => {
            dispatch(incrementByAmount(amount));
        }, 1000);

    };

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectCount = state => state.counter.value;

export default counterSlice.reducer;
