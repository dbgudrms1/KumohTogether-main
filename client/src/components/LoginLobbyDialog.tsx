import React, { useState } from 'react'
import logo from '../assets/logo.png'
import styled from 'styled-components'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { useAppDispatch, useAppSelector } from '../hooks'

import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'
import { InputAdornment, LinearProgress, TextField } from '@mui/material'
import { IUser } from '../../../types/Users'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import store from '../stores'
import { setLoggedSuccess, setRegistermode,setSuser,setAdminMode} from '../stores/UserStore'
import MemberRegister from './MemberRegister'

const Backdrop = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  gap: 60px;
  align-items: center;
`

const Wrapper = styled.form`
  background: #222639;
  border-radius: 16px;
  padding: 36px 60px;
  box-shadow: 0px 0px 5px #0000006f;
`

const BackButtonWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
`

const Title = styled.h1`
  font-size: 24px;
  color: #eee;
  text-align: center;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 20px 0;
  align-items: center;
  justify-content: center;

  img {
    border-radius: 8px;
    height: 120px;
  }
`
const ProgressBar = styled(LinearProgress)`
  width: 360px;
`
const ProgressBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  h3 {
    color: #33ac96;
  }
`
export default function LoginLobbyDialog() {
  const dispatch = useAppDispatch()
  const loggedSuccesss = useAppSelector((state) => state.user.loggedSuccess)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined)
  const [idFieldEmpty, setIdFieldEmpty] = useState<boolean>(false)
  const [pwFieldEmpty, setPwFieldEmpty] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState(false)
  const [values, setValues] = useState<IUser>({
    id: '',
    password: '',
    result: false,
    msg: '',
    code: 0,
  })
  
  const handleChange = (prop: keyof IUser) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const isValidId = values.id !== ''
    const isValidPassword = values.password !== ''

    if (isValidId === idFieldEmpty) setIdFieldEmpty(!idFieldEmpty)
    if (isValidPassword === pwFieldEmpty) setPwFieldEmpty(!pwFieldEmpty)
    dispatch(setSuser(values.id))
    
    if (isValidId && isValidPassword && lobbyJoined) {
      dispatch(setLoggedSuccess(false))
      const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
      const login = false
      
      bootstrap.network.tryLogin(values, (identi,login)=>{
        console.log(identi)
        console.log(login)
        if (login) {
          if(identi !=='관리자')
          {
          console.log('로그인성공')
          bootstrap.network
            .joinOrCreatePublic()
            .then(() => bootstrap.launchGame())
            .catch((error) => console.error(error))
          }
          else
          {
            dispatch(setAdminMode(true));
          }
        }
      })
    }
  }

  const Register = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log('Register');
   
    store.dispatch(setRegistermode(true))
      
  }
  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => {
          setShowSnackbar(false)
        }}
      >
        <Alert
          severity="error"
          variant="outlined"
          // overwrites the dark theme on render
          style={{ background: '#fdeded', color: '#7d4747' }}
        >
          Trying to connect to server, please try again!
        </Alert>
      </Snackbar>
      <Backdrop>
        <Wrapper onSubmit={handleSubmit}>
          <Title>Welcome to KumohTogether</Title>
          <Content onSubmit={handleSubmit}>
            <img src={logo} alt="logo" />
            <TextField
              autoFocus
              fullWidth
              label="id"
              variant="outlined"
              color="secondary"
              error={idFieldEmpty}
              helperText={idFieldEmpty && 'ID가 필요합니다.'}
              onChange={handleChange('id')}
            />
            <TextField
              type={showPassword ? 'text' : 'password'}
              autoFocus
              fullWidth
              label="password"
              variant="outlined"
              color="secondary"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={pwFieldEmpty}
              helperText={pwFieldEmpty && '비밀번호가 필요합니다.'}
              onChange={handleChange('password')}
            />
            <Button variant="contained" color="secondary" type="submit">
              LogIn
            </Button>
          </Content>
        </Wrapper>
        <Wrapper onSubmit={Register}>
        <Content onSubmit={Register}>
          <Button variant="contained" color="secondary" type="submit">
              회원가입
            </Button>
            
        </Content>
        </Wrapper>
{!lobbyJoined && (
          <ProgressBarWrapper>
            <h3> 서버 연결 중...</h3>
            <ProgressBar color="secondary" />
          </ProgressBarWrapper>
        )}
      </Backdrop>
    </>
  )
}
