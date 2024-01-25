import {
  addCat,
  deleteCat,
  getAllCats,
  getCat,
  updateCat,
} from '../models/catModel';
import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import {validationResult} from 'express-validator';
import {MessageResponse} from '../../types/MessageTypes';
import {Cat, User} from '../../types/DBTypes';

const catListGet = async (
  _req: Request,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const cats = await getAllCats();
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catGet = async (req: Request, res: Response<Cat>, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const id = Number(req.params.id);
    const cat = await getCat(id);
    res.json(cat);
  } catch (error) {
    next(error);
  }
};

// TODO: create catPost function to add new cat
const catPost = async (
  req: Request<{}, {}, Omit<Cat, 'owner'> & {owner: number}>,
  res: Response<MessageResponse, {coords: [number, number]}>,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const catData = {
      ...req.body,
      owner: req.user?.user_id || req.body.owner, // Use user_id from req.user if available
    };

    const result = await addCat(catData);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const catPut = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const id = Number(req.params.id);
    const cat = req.body;
    const result = await updateCat({...cat, cat_id: id}, req.user!);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// TODO: create catDelete function to delete cat
// catDelete should use deleteCat function from catModel
// catDelete should use validationResult to validate req.params.id

const catDelete = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const catId = Number(req.params.id);
    const result = await deleteCat(catId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export {catListGet, catGet, catPost, catPut, catDelete};
